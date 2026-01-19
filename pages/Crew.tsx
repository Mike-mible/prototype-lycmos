
import React, { useEffect, useState } from 'react';
import { mosApi } from '../services/api';
import { Crew } from '../types';
import { User, Shield, AlertCircle, Phone, MoreVertical } from 'lucide-react';

const CrewPage: React.FC = () => {
  const [crew, setCrew] = useState<Crew[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mosApi.getCrew().then(data => {
      setCrew(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Crew Directory</h1>
          <p className="text-slate-500 font-medium">Monitor drivers and conductors performance and trust metrics</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all">
          Register New Crew
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Name & Role</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Branch</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Trust Score</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Incidents</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-slate-400">Loading crew data...</td></tr>
            ) : crew.map(c => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{c.name}</p>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{c.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-medium">{c.branchId}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                    c.status === 'ASSIGNED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col items-center gap-1">
                    <span className={`text-sm font-bold ${c.trustScore > 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {c.trustScore}%
                    </span>
                    <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${c.trustScore > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                        style={{ width: `${c.trustScore}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`text-sm font-bold ${c.incidentsCount > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                    {c.incidentsCount}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                   <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                    <MoreVertical size={18} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CrewPage;
