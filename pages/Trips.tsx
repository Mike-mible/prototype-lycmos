
import React, { useEffect, useState } from 'react';
import { mosApi, mosWs } from '../services/api';
import { Trip, Segment, SegmentState, AllowedAction, Vehicle, Crew, Branch } from '../types';
import { Play, Square, Wallet, AlertOctagon, Repeat, CheckCircle2, Search, Filter, RefreshCw, Plus, X } from 'lucide-react';

const Trips: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [crew, setCrew] = useState<Crew[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ route: '', segments: [{ branchId: '', vehicleId: '', crewIds: [] as string[] }] });

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true); else setIsRefreshing(true);
    try {
      const [t, b, v, c] = await Promise.all([mosApi.getTrips(), mosApi.getBranches(), mosApi.getVehicles(), mosApi.getCrew()]);
      setTrips(t); setBranches(b); setVehicles(v); setCrew(c);
    } finally { setLoading(false); setIsRefreshing(false); }
  };

  useEffect(() => {
    fetchData();
    const unbind = mosWs.on('SEGMENT_UPDATED', () => fetchData(true));
    return () => unbind();
  }, []);

  const handleAction = async (segmentId: string, action: AllowedAction) => {
    if (action === 'START') await mosApi.startSegment(segmentId);
    if (action === 'END') await mosApi.endSegment(segmentId);
    if (action === 'DECLARE_REVENUE') await mosApi.declareRevenue(segmentId, 5000);
    fetchData(true);
  };

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalSegments = formData.segments.map(s => ({
      ...s,
      state: SegmentState.PENDING,
      revenue: 0,
      trustScore: 100,
      allowedActions: ['START'] as AllowedAction[]
    }));
    await mosApi.createTrip({ route: formData.route, overallStatus: 'PENDING' }, finalSegments);
    setShowModal(false);
    fetchData();
  };

  const getStateColor = (state: SegmentState) => {
    switch (state) {
      case SegmentState.ACTIVE: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case SegmentState.PENDING: return 'bg-amber-100 text-amber-700 border-amber-200';
      case SegmentState.CLOSED: return 'bg-slate-100 text-slate-500 border-slate-200';
      case SegmentState.HANDOVER_PENDING: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            Trips & Segments {isRefreshing && <RefreshCw size={16} className="text-blue-500 animate-spin" />}
          </h1>
          <p className="text-slate-500 font-medium">Manage cross-branch journeys and segments in real-time</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ route: '', segments: [{ branchId: branches[0]?.id || '', vehicleId: vehicles[0]?.id || '', crewIds: [] }] });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
        >
          <Plus size={20} /> Create New Trip
        </button>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="p-20 text-center text-slate-400 font-medium">Loading Trips...</div>
        ) : trips.map(trip => (
          <div key={trip.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded uppercase">{trip.id}</span>
                  <h3 className="text-lg font-bold text-slate-800">{trip.route}</h3>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Status</p>
                  <p className="font-bold text-blue-600 uppercase text-xs tracking-widest">{trip.overallStatus}</p>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Segment</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Details</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Revenue</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">State</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {trip.segments.map(seg => (
                    <tr key={seg.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-700">{seg.id}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900">{branches.find(b => b.id === seg.branchId)?.name || seg.branchId}</p>
                        <p className="text-xs font-mono text-slate-500 uppercase">{vehicles.find(v => v.id === seg.vehicleId)?.plate || seg.vehicleId}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">KES {seg.revenue.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black border uppercase ${getStateColor(seg.state)}`}>{seg.state}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {seg.allowedActions.includes('START') && (
                            <button onClick={() => handleAction(seg.id, 'START')} className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><Play size={16} fill="currentColor" /></button>
                          )}
                          {seg.allowedActions.includes('END') && (
                            <button onClick={() => handleAction(seg.id, 'END')} className="p-2 bg-red-100 text-red-700 rounded-lg"><Square size={16} fill="currentColor" /></button>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl my-8 animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Configure Trip Journey</h2>
              <button onClick={() => setShowModal(false)}><X size={24} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateTrip} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Main Route Corridor</label>
                <input required value={formData.route} onChange={e => setFormData({...formData, route: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border rounded-xl" placeholder="e.g., Nairobi - Mombasa" />
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Journey Segments</h3>
                  <button type="button" onClick={() => setFormData({...formData, segments: [...formData.segments, { branchId: branches[0]?.id || '', vehicleId: vehicles[0]?.id || '', crewIds: [] }]})} className="text-blue-600 font-bold text-xs flex items-center gap-1"><Plus size={14} /> Add Stage</button>
                </div>
                {formData.segments.map((s, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border rounded-2xl relative space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Operating Branch</label>
                        <select value={s.branchId} onChange={e => {
                          const newSegs = [...formData.segments];
                          newSegs[idx].branchId = e.target.value;
                          setFormData({...formData, segments: newSegs});
                        }} className="w-full px-3 py-2 bg-white border rounded-lg text-sm">
                          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Vehicle</label>
                        <select value={s.vehicleId} onChange={e => {
                          const newSegs = [...formData.segments];
                          newSegs[idx].vehicleId = e.target.value;
                          setFormData({...formData, segments: newSegs});
                        }} className="w-full px-3 py-2 bg-white border rounded-lg text-sm">
                          {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate}</option>)}
                        </select>
                      </div>
                    </div>
                    {idx > 0 && <button type="button" onClick={() => {
                      const newSegs = [...formData.segments];
                      newSegs.splice(idx, 1);
                      setFormData({...formData, segments: newSegs});
                    }} className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full border shadow-sm p-1"><X size={14} /></button>}
                  </div>
                ))}
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-500/20">Initialize Journey</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trips;
