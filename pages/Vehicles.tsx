
import React, { useEffect, useState } from 'react';
import { mosApi } from '../services/api';
import { Vehicle } from '../types';
import { Bus, Settings, MoreVertical, Search, Plus } from 'lucide-react';

const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mosApi.getVehicles().then(data => {
      setVehicles(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Vehicle Fleet</h1>
          <p className="text-slate-500 font-medium">Monitor and manage all SACCO matatus</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30">
          <Plus size={20} /> Add Vehicle
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter by plate number or branch..." 
              className="pl-10 pr-4 py-2 w-full rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button className="px-4 py-2 bg-slate-50 text-slate-600 font-bold rounded-xl border border-slate-200 flex-1 md:flex-none">All Statuses</button>
            <button className="px-4 py-2 bg-slate-50 text-slate-600 font-bold rounded-xl border border-slate-200 flex-1 md:flex-none">All Branches</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Matatu Plate</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Assigned Branch</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Trust Score</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Lifetime Revenue</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">Loading fleet data...</td></tr>
              ) : vehicles.map(v => (
                <tr key={v.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <Bus className="text-slate-600 group-hover:text-blue-600" size={20} />
                      </div>
                      <span className="font-bold text-slate-900 tracking-wider">{v.plate}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600">{v.branchId}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                      v.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 
                      v.status === 'IDLE' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 w-24 bg-slate-100 h-1.5 rounded-full">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${v.trustScore}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-slate-900">{v.trustScore}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    KES {v.revenueGenerated.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-slate-200 rounded-lg"><Settings size={18} className="text-slate-600" /></button>
                      <button className="p-2 hover:bg-slate-200 rounded-lg"><MoreVertical size={18} className="text-slate-600" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Vehicles;
