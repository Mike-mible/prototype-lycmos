
import React, { useEffect, useState } from 'react';
import { mosApi, mosWs } from '../services/api';
import { Trip, Segment, SegmentState, AllowedAction } from '../types';
import { Play, Square, Wallet, AlertOctagon, Repeat, CheckCircle2, Search, Filter, RefreshCw } from 'lucide-react';

const Trips: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTrips = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    
    try {
      const data = await mosApi.getTrips();
      setTrips(data);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrips();

    // Listen for real-time segment updates
    const unbind = mosWs.on('SEGMENT_UPDATED', (data) => {
      console.log("Real-time Update: Segment state changed", data);
      fetchTrips(true); // Silent refresh
    });

    return () => unbind();
  }, []);

  const handleAction = async (segmentId: string, action: AllowedAction) => {
    try {
      if (action === 'START') await mosApi.startSegment(segmentId);
      if (action === 'END') await mosApi.endSegment(segmentId);
      if (action === 'DECLARE_REVENUE') await mosApi.declareRevenue(segmentId, 5000);
      
      await fetchTrips(true);
    } catch (err) {
      console.error("Action failed", err);
    }
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
            Trips & Segments
            {isRefreshing && <RefreshCw size={16} className="text-blue-500 animate-spin" />}
          </h1>
          <p className="text-slate-500 font-medium">Manage cross-branch journeys and segments in real-time</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Trip ID, Route..." 
              className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
            />
          </div>
          <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <Filter size={20} className="text-slate-600" />
          </button>
        </div>
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
                <p className="text-slate-500 text-sm mt-1">Multi-segment journey via {trip.segments.length} branches</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Trip Status</p>
                  <p className="font-bold text-blue-600">{trip.overallStatus}</p>
                </div>
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50">Details</button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Segment</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Branch & Vehicle</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Crew</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Trust</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">State</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {trip.segments.map(seg => (
                    <tr key={seg.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700">{seg.id}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900">{seg.branchId}</p>
                        <p className="text-xs font-mono text-slate-500">{seg.vehicleId}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex -space-x-2">
                          {seg.crewIds.map(cid => (
                            <div key={cid} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold" title={cid}>
                              {cid.split('-')[1]}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {seg.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden max-w-[60px]">
                          <div className={`h-full rounded-full ${seg.trustScore > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${seg.trustScore}%` }}></div>
                        </div>
                        <p className="text-[10px] font-bold mt-1 text-slate-500">{seg.trustScore}%</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black border uppercase ${getStateColor(seg.state)}`}>
                          {seg.state}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {seg.allowedActions.includes('START') && (
                            <button onClick={() => handleAction(seg.id, 'START')} className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-all shadow-sm" title="Start Segment">
                              <Play size={16} fill="currentColor" />
                            </button>
                          )}
                          {seg.allowedActions.includes('END') && (
                            <button onClick={() => handleAction(seg.id, 'END')} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all shadow-sm" title="End Segment">
                              <Square size={16} fill="currentColor" />
                            </button>
                          )}
                          {seg.allowedActions.includes('DECLARE_REVENUE') && (
                            <button onClick={() => handleAction(seg.id, 'DECLARE_REVENUE')} className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all shadow-sm" title="Declare Revenue">
                              <Wallet size={16} />
                            </button>
                          )}
                          {seg.allowedActions.includes('REPORT_INCIDENT') && (
                            <button className="p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-all shadow-sm" title="Report Incident">
                              <AlertOctagon size={16} />
                            </button>
                          )}
                          {seg.allowedActions.includes('CONFIRM_HANDOVER') && (
                            <button className="p-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-all shadow-sm" title="Confirm Handover">
                              <Repeat size={16} />
                            </button>
                          )}
                          {seg.state === SegmentState.CLOSED && (
                            <div className="text-emerald-500"><CheckCircle2 size={20} /></div>
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
    </div>
  );
};

export default Trips;
