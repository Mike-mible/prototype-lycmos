
import React, { useEffect, useState, useMemo } from 'react';
import { mosApi, mosWs } from '../services/api';
import { Trip, Segment, SegmentState, AllowedAction, Vehicle, Crew, Branch } from '../types';
import { Play, Square, Wallet, AlertOctagon, Repeat, CheckCircle2, Search, Filter, RefreshCw, Plus, X, Handshake } from 'lucide-react';

interface TripsProps {
  searchQuery?: string;
}

const Trips: React.FC<TripsProps> = ({ searchQuery = '' }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [crew, setCrew] = useState<Crew[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ route: '', segments: [{ branchId: '', vehicleId: '', crewIds: [] as string[] }] });

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true); else setIsRefreshing(true);
    try {
      const [t, b, v, c] = await Promise.all([mosApi.getTrips(), mosApi.getBranches(), mosApi.getVehicles(), mosApi.getCrew()]);
      setTrips(t); setBranches(b); setVehicles(v); setCrew(c);
    } catch (err) {
      console.error("Fetch failure:", err);
    } finally { setLoading(false); setIsRefreshing(false); }
  };

  useEffect(() => {
    fetchData();
    const unbind = mosWs.on('SEGMENT_UPDATED', () => fetchData(true));
    return () => unbind();
  }, []);

  const filteredTrips = useMemo(() => {
    return trips.filter(t => 
      t.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [trips, searchQuery]);

  const handleAction = async (segmentId: string, action: AllowedAction) => {
    setProcessingId(segmentId);
    try {
      if (action === 'START') await mosApi.startSegment(segmentId);
      if (action === 'END') await mosApi.endSegment(segmentId);
      if (action === 'CONFIRM_HANDOVER') await mosApi.confirmHandover(segmentId);
      if (action === 'DECLARE_REVENUE') {
        const amount = prompt("Enter revenue amount (KES):", "1000");
        if (amount) await mosApi.declareRevenue(segmentId, parseInt(amount));
      }
      await fetchData(true);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteTrip = async (id: string) => {
    if(!confirm("Are you sure? This will delete the trip and all its segments.")) return;
    await mosApi.deleteTrip(id);
    fetchData();
  };

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await mosApi.createTrip(
        { 
          route: formData.route.toUpperCase(), 
          overallStatus: 'ACTIVE' 
        }, 
        formData.segments.map(s => ({
          ...s,
          state: SegmentState.PENDING,
          revenue: 0,
          allowedActions: ['START'] as AllowedAction[]
        }))
      );
      setShowModal(false);
      await fetchData();
    } catch (err: any) {
      console.error("Initialization failure:", err);
      alert(`Logic initialization failed: ${err.message || 'Unknown database error'}. Check if RLS policies are enabled.`);
    } finally {
      setIsSaving(false);
    }
  };

  const getStateColor = (state: SegmentState) => {
    switch (state) {
      case SegmentState.ACTIVE: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case SegmentState.PENDING: return 'bg-amber-50 text-amber-700 border-amber-100';
      case SegmentState.CLOSED: return 'bg-slate-50 text-slate-400 border-slate-100';
      case SegmentState.HANDOVER_PENDING: return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            Trips & Logistics {(isRefreshing || loading) && <RefreshCw size={24} className="text-blue-500 animate-spin" />}
          </h1>
          <p className="text-slate-500 font-medium mt-1">Global coordination of cross-branch segments</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ route: '', segments: [{ branchId: branches[0]?.id || '', vehicleId: vehicles[0]?.id || '', crewIds: [] }] });
            setShowModal(true);
          }}
          className="bg-slate-900 text-white px-8 py-3.5 rounded-[24px] font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/10 active:scale-95"
        >
          <Plus size={20} /> Create New Trip
        </button>
      </div>

      <div className="grid gap-8">
        {loading && trips.length === 0 ? (
          <div className="p-32 text-center text-slate-400 font-black uppercase tracking-[0.3em] text-xs">Synchronizing Core Engine...</div>
        ) : filteredTrips.length === 0 ? (
          <div className="p-20 text-center bg-white rounded-[40px] border border-slate-100 text-slate-400 font-medium">
            {searchQuery ? `No trips matching "${searchQuery}"` : "No active trips in the system."}
          </div>
        ) : filteredTrips.map(trip => (
          <div key={trip.id} className="bg-white rounded-[40px] shadow-[0_30px_60px_rgba(0,0,0,0.03)] border border-slate-100/80 overflow-hidden group">
            <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black px-3 py-1 bg-slate-900 text-white rounded-full uppercase tracking-widest truncate max-w-[100px]">{trip.id}</span>
                <h3 className="text-2xl font-black text-slate-900">{trip.route}</h3>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Operational State</p>
                  <p className="font-black text-blue-600 uppercase text-xs tracking-[0.2em]">{trip.overallStatus}</p>
                </div>
                <button onClick={() => handleDeleteTrip(trip.id)} className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><X size={20}/></button>
              </div>
            </div>
            
            <div className="overflow-x-auto px-4 pb-4">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100/50">
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Node</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Revenue</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Lifecycle</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Command</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50">
                  {trip.segments?.map(seg => (
                    <tr key={seg.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 text-sm tracking-tight">{branches.find(b => b.id === seg.branchId)?.name || seg.branchId}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Hub Node</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded-lg"><Repeat size={14} className="text-slate-500" /></div>
                          <span className="text-sm font-black text-slate-700 tracking-widest uppercase">{vehicles.find(v => v.id === seg.vehicleId)?.plate || seg.vehicleId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="text-sm font-black text-slate-900">KES {(seg.revenue || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${getStateColor(seg.state)}`}>
                          {seg.state}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          {seg.allowedActions?.includes('START') && (
                            <button disabled={processingId === seg.id} onClick={() => handleAction(seg.id, 'START')} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 border border-emerald-100 shadow-sm transition-all active:scale-95" title="Initialize Segment"><Play size={18} fill="currentColor" /></button>
                          )}
                          {seg.allowedActions?.includes('CONFIRM_HANDOVER') && (
                            <button disabled={processingId === seg.id} onClick={() => handleAction(seg.id, 'CONFIRM_HANDOVER')} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 border border-indigo-100 shadow-sm transition-all active:scale-95" title="Confirm Handover"><Handshake size={18} /></button>
                          )}
                          {seg.allowedActions?.includes('DECLARE_REVENUE') && (
                            <button disabled={processingId === seg.id} onClick={() => handleAction(seg.id, 'DECLARE_REVENUE')} className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl hover:bg-amber-100 border border-amber-100 shadow-sm transition-all active:scale-95" title="Declare Earnings"><Wallet size={18} /></button>
                          )}
                          {seg.allowedActions?.includes('END') && (
                            <button disabled={processingId === seg.id} onClick={() => handleAction(seg.id, 'END')} className="p-2.5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-all active:scale-95" title="Terminate Segment"><Square size={18} fill="currentColor" /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-white rounded-[48px] w-full max-w-2xl shadow-[0_40px_100px_rgba(0,0,0,0.2)] my-8 animate-in zoom-in duration-300 border border-white">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Logic Initialization</h2>
                <p className="text-slate-500 font-medium">Define nodes for the new trip journey</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-4 hover:bg-white rounded-full transition-all shadow-sm"><X size={24} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateTrip} className="p-10 space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Service Corridor</label>
                <input required value={formData.route} onChange={e => setFormData({...formData, route: e.target.value.toUpperCase()})} className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl font-black text-xl uppercase tracking-widest focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-inner" placeholder="E.G. NAIROBI - MOMBASA" />
              </div>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Journey Segments</h3>
                  <button type="button" onClick={() => setFormData({...formData, segments: [...formData.segments, { branchId: branches[0]?.id || '', vehicleId: vehicles[0]?.id || '', crewIds: [] }]})} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-100 transition-all"><Plus size={14} /> Add Station</button>
                </div>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                  {formData.segments.map((s, idx) => (
                    <div key={idx} className="p-6 bg-slate-50 border border-slate-200 rounded-[32px] relative space-y-4 shadow-sm hover:border-blue-200 transition-all">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Controlling Hub</label>
                          <select value={s.branchId} onChange={e => {
                            const newSegs = [...formData.segments];
                            newSegs[idx].branchId = e.target.value;
                            setFormData({...formData, segments: newSegs});
                          }} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-blue-500 transition-all">
                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Operational Asset</label>
                          <select value={s.vehicleId} onChange={e => {
                            const newSegs = [...formData.segments];
                            newSegs[idx].vehicleId = e.target.value;
                            setFormData({...formData, segments: newSegs});
                          }} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-blue-500 transition-all">
                            {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate}</option>)}
                          </select>
                        </div>
                      </div>
                      {idx > 0 && <button type="button" onClick={() => {
                        const newSegs = [...formData.segments];
                        newSegs.splice(idx, 1);
                        setFormData({...formData, segments: newSegs});
                      }} className="absolute -top-3 -right-3 bg-white text-red-500 rounded-full border shadow-xl p-2 hover:bg-red-50 transition-all"><X size={16} /></button>}
                    </div>
                  ))}
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full py-6 bg-blue-600 text-white rounded-[32px] font-black text-lg uppercase tracking-widest hover:bg-blue-700 shadow-[0_20px_50px_rgba(37,99,235,0.3)] active:scale-95 transition-all disabled:opacity-50"
              >
                {isSaving ? 'Initializing Kernel Record...' : 'Initialize Distributed Journey'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trips;
