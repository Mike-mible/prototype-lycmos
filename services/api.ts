
import { 
  Trip, Segment, Branch, Vehicle, Crew, SMSTicket, Incident, DashboardMetrics, SegmentState 
} from '../types';
import { supabase } from './supabase';

type WSEventHandler = (data: any) => void;

class WebSocketService {
  private listeners: Map<string, Set<WSEventHandler>> = new Map();
  private statusListeners: Set<(connected: boolean) => void> = new Set();
  private systemBus: BroadcastChannel | null = null;

  constructor() {
    this.systemBus = new BroadcastChannel('LYNC_SYSTEM_BUS');
  }

  connect() {
    console.log("Supabase: Initiating Realtime connection...");
    
    supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'segments' }, (payload: any) => {
        this.emit('SEGMENT_UPDATED', { 
          segmentId: payload.new?.id, 
          state: payload.new?.state,
          message: `Segment ${payload.new?.id} updated: ${payload.new?.state}`
        });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sms_tickets' }, (payload: any) => {
        this.emit('NEW_SMS_TICKET', { 
          id: payload.new?.id,
          message: `New SMS Ticket from ${payload.new?.passengerPhone}`
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'segments' }, (payload: any) => {
        if (payload.new?.revenue > payload.old?.revenue) {
           this.emit('REVENUE_DECLARED', { 
              amount: (payload.new?.revenue || 0) - (payload.old?.revenue || 0), 
              branchId: payload.new?.branchId,
              message: `Revenue Inflow: KES ${(payload.new?.revenue || 0) - (payload.old?.revenue || 0)} at ${payload.new?.branchId}`
            });
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'crew' }, (payload: any) => {
        this.emit('CREW_UPDATED', { 
          crewId: payload.new?.id,
          status: payload.new?.status,
          message: `Crew member ${payload.new?.name} is now ${payload.new?.status}`
        });
      })
      .subscribe((status) => {
        console.log("Supabase Realtime Status:", status);
        if (status === 'SUBSCRIBED') {
          this.notifyStatus(true);
          this.simulateLyncBus();
        }
      });
  }

  on(event: string, handler: WSEventHandler) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)?.add(handler);
    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  onStatusChange(handler: (connected: boolean) => void) {
    this.statusListeners.add(handler);
    return () => {
      this.statusListeners.delete(handler);
    };
  }

  private notifyStatus(connected: boolean) {
    this.statusListeners.forEach(h => h(connected));
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(h => h(data));
  }

  private simulateLyncBus() {
    setInterval(() => {
      this.systemBus?.postMessage({
        type: 'STATE_UPLINK',
        payload: {
          status: 'HEALTHY',
          active_nodes: 12,
          db_connected: true,
          timestamp: Date.now()
        }
      });
    }, 15000);
  }
}

export const mosWs = new WebSocketService();

export const mosApi = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    try {
      const { data: trips } = await supabase.from('trips').select('id');
      const { data: segments } = await supabase.from('segments').select('revenue, state');
      const activeCount = segments?.filter(s => s.state === 'ACTIVE').length || 0;
      const totalRev = segments?.reduce((acc, s) => acc + (s.revenue || 0), 0) || 0;
      return {
        totalTripsToday: trips?.length || 0,
        activeSegments: activeCount,
        revenueSummary: totalRev,
        avgTrustScore: 88,
        upcomingHandovers: segments?.filter(s => s.state === 'HANDOVER_PENDING').length || 0
      };
    } catch {
      return { totalTripsToday: 0, activeSegments: 0, revenueSummary: 0, avgTrustScore: 0, upcomingHandovers: 0 };
    }
  },

  getTrips: async (): Promise<Trip[]> => {
    const { data } = await supabase.from('trips').select('*, segments(*)');
    return data || [];
  },

  createTrip: async (tripData: Partial<Trip>, segments: Partial<Segment>[]) => {
    const { data: trip, error: tErr } = await supabase.from('trips').insert(tripData).select().single();
    if (tErr) throw tErr;
    const segmentsWithTripId = segments.map(s => ({ ...s, tripId: trip.id }));
    const { error: sErr } = await supabase.from('segments').insert(segmentsWithTripId);
    if (sErr) throw sErr;
    return trip;
  },

  updateTrip: async (id: string, tripData: Partial<Trip>) => {
    return await supabase.from('trips').update(tripData).eq('id', id);
  },

  deleteTrip: async (id: string) => {
    await supabase.from('segments').delete().eq('tripId', id);
    return await supabase.from('trips').delete().eq('id', id);
  },

  startSegment: async (id: string) => {
    return await supabase.from('segments').update({ state: SegmentState.ACTIVE, startTime: new Date().toISOString(), allowedActions: ['END', 'DECLARE_REVENUE', 'REPORT_INCIDENT'] }).eq('id', id);
  },

  endSegment: async (id: string) => {
    return await supabase.from('segments').update({ state: SegmentState.CLOSED, endTime: new Date().toISOString(), allowedActions: [] }).eq('id', id);
  },

  confirmHandover: async (id: string) => {
    return await supabase.from('segments').update({ state: SegmentState.ACTIVE, allowedActions: ['END', 'DECLARE_REVENUE'] }).eq('id', id);
  },

  declareRevenue: async (id: string, amount: number) => {
    const { data: current } = await supabase.from('segments').select('revenue').eq('id', id).single();
    return await supabase.from('segments').update({ revenue: (current?.revenue || 0) + amount }).eq('id', id);
  },

  getBranches: async (): Promise<Branch[]> => {
    const { data } = await supabase.from('branches').select('*');
    return data || [];
  },

  createBranch: async (branch: Partial<Branch>) => {
    return await supabase.from('branches').insert(branch);
  },

  updateBranch: async (id: string, branch: Partial<Branch>) => {
    return await supabase.from('branches').update(branch).eq('id', id);
  },

  deleteBranch: async (id: string) => {
    return await supabase.from('branches').delete().eq('id', id);
  },

  getVehicles: async (): Promise<Vehicle[]> => {
    const { data } = await supabase.from('vehicles').select('*');
    return data || [];
  },

  createVehicle: async (vehicle: Partial<Vehicle>) => {
    return await supabase.from('vehicles').insert({ ...vehicle, trustScore: 100, revenueGenerated: 0 });
  },

  updateVehicle: async (id: string, vehicle: Partial<Vehicle>) => {
    return await supabase.from('vehicles').update(vehicle).eq('id', id);
  },

  deleteVehicle: async (id: string) => {
    return await supabase.from('vehicles').delete().eq('id', id);
  },

  getCrew: async (): Promise<Crew[]> => {
    const { data } = await supabase.from('crew').select('*');
    return data || [];
  },

  createCrew: async (crew: Partial<Crew>) => {
    return await supabase.from('crew').insert({ ...crew, trustScore: 100, incidentsCount: 0 });
  },

  updateCrew: async (id: string, crew: Partial<Crew>) => {
    return await supabase.from('crew').update(crew).eq('id', id);
  },

  deleteCrew: async (id: string) => {
    return await supabase.from('crew').delete().eq('id', id);
  },

  getSMSTickets: async (): Promise<SMSTicket[]> => {
    const { data } = await supabase.from('sms_tickets').select('*').order('timestamp', { ascending: false });
    return data || [];
  },

  confirmTicket: async (id: string) => {
    return await supabase.from('sms_tickets').update({ status: 'CONFIRMED' }).eq('id', id);
  },

  cancelTicket: async (id: string) => {
    return await supabase.from('sms_tickets').update({ status: 'CANCELLED' }).eq('id', id);
  },

  getIncidents: async (): Promise<Incident[]> => {
    const { data } = await supabase.from('incidents').select('*').order('timestamp', { ascending: false });
    return data || [];
  },

  resolveIncident: async (id: string) => {
    return await supabase.from('incidents').update({ status: 'RESOLVED' }).eq('id', id);
  },

  escalateIncident: async (id: string) => {
    return await supabase.from('incidents').update({ status: 'ESCALATED' }).eq('id', id);
  }
};
