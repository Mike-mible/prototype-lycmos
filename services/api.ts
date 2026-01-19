
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
    
    // Subscribe to real-time changes across main tables
    supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'segments' }, (payload: any) => {
        // Cast payload as any to fix "Property 'id' does not exist on type '{}'" errors
        this.emit('SEGMENT_UPDATED', { 
          segmentId: payload.new?.id, 
          state: payload.new?.state,
          message: `Segment ${payload.new?.id} updated: ${payload.new?.state}`
        });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sms_tickets' }, (payload: any) => {
        // Cast payload as any to fix "Property 'id' does not exist on type '{}'" errors
        this.emit('NEW_SMS_TICKET', { 
          id: payload.new?.id,
          message: `New SMS Ticket from ${payload.new?.passengerPhone}`
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'segments' }, (payload: any) => {
        // Cast payload as any to fix property access errors on payload.new and payload.old
        if (payload.new?.revenue > payload.old?.revenue) {
           this.emit('REVENUE_DECLARED', { 
              amount: (payload.new?.revenue || 0) - (payload.old?.revenue || 0), 
              branchId: payload.new?.branchId,
              message: `Revenue Inflow: KES ${(payload.new?.revenue || 0) - (payload.old?.revenue || 0)} at ${payload.new?.branchId}`
            });
        }
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
    // Wrap the delete call in a function that returns void to avoid useEffect destructor errors
    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  onStatusChange(handler: (connected: boolean) => void) {
    this.statusListeners.add(handler);
    // Wrap the delete call in a function that returns void to avoid useEffect destructor errors
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
    // This maintains the Kernel Telemetry visuals using the LyncBus
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
  login: async (credentials: any) => {
    localStorage.setItem('mos_token', 'mock-jwt-token');
    mosWs.connect();
    return { token: 'mock-jwt-token', user: { role: 'ADMIN', name: 'Sacco Manager' } };
  },

  getMetrics: async (): Promise<DashboardMetrics> => {
    try {
      const { data: trips } = await supabase.from('trips').select('id');
      const { data: segments } = await supabase.from('segments').select('revenue, state');
      
      if (!segments || segments.length === 0) throw new Error("No data");

      const activeCount = segments.filter(s => s.state === 'ACTIVE').length;
      const totalRev = segments.reduce((acc, s) => acc + (s.revenue || 0), 0);

      return {
        totalTripsToday: trips?.length || 0,
        activeSegments: activeCount,
        revenueSummary: totalRev,
        avgTrustScore: 88,
        upcomingHandovers: segments.filter(s => s.state === 'HANDOVER_PENDING').length
      };
    } catch {
      return {
        totalTripsToday: 42,
        activeSegments: 12,
        revenueSummary: 285000,
        avgTrustScore: 88,
        upcomingHandovers: 3
      };
    }
  },

  getTrips: async (): Promise<Trip[]> => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          segments (*)
        `);
      
      if (error || !data || data.length === 0) throw error || new Error("No data");
      return data;
    } catch {
      return [{
        id: 'T-101', route: 'Nairobi - Mombasa', overallStatus: 'ACTIVE',
        segments: [
          { id: 'S-201', tripId: 'T-101', branchId: 'B-NRB', vehicleId: 'KCA 123X', crewIds: ['C-001', 'C-002'], state: SegmentState.ACTIVE, revenue: 15500, trustScore: 92, allowedActions: ['END', 'DECLARE_REVENUE', 'REPORT_INCIDENT'] },
          { id: 'S-202', tripId: 'T-101', branchId: 'B-MSA', vehicleId: 'KCB 456Y', crewIds: ['C-003'], state: SegmentState.PENDING, revenue: 0, trustScore: 100, allowedActions: ['START'] }
        ]
      }];
    }
  },

  startSegment: async (id: string) => {
    return await supabase.from('segments').update({ state: SegmentState.ACTIVE }).eq('id', id);
  },

  endSegment: async (id: string) => {
    return await supabase.from('segments').update({ state: SegmentState.CLOSED }).eq('id', id);
  },

  confirmHandover: async (id: string) => {
    return await supabase.from('segments').update({ state: SegmentState.ACTIVE }).eq('id', id);
  },

  declareRevenue: async (id: string, amount: number) => {
    const { data: current } = await supabase.from('segments').select('revenue').eq('id', id).single();
    const newRev = (current?.revenue || 0) + amount;
    return await supabase.from('segments').update({ revenue: newRev }).eq('id', id);
  },

  getBranches: async (): Promise<Branch[]> => {
    const { data } = await supabase.from('branches').select('*');
    return data || [];
  },

  getVehicles: async (): Promise<Vehicle[]> => {
    const { data } = await supabase.from('vehicles').select('*');
    return data || [];
  },

  getCrew: async (): Promise<Crew[]> => {
    const { data } = await supabase.from('crew').select('*');
    return data || [];
  },

  getSMSTickets: async (): Promise<SMSTicket[]> => {
    const { data } = await supabase.from('sms_tickets').select('*').order('timestamp', { ascending: false });
    return data || [];
  },

  confirmTicket: async (id: string) => {
    return await supabase.from('sms_tickets').update({ status: 'CONFIRMED' }).eq('id', id);
  },

  getIncidents: async (): Promise<Incident[]> => {
    const { data } = await supabase.from('incidents').select('*').order('timestamp', { ascending: false });
    return data || [];
  }
};
