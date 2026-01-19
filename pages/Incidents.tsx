
import React, { useEffect, useState } from 'react';
import { mosApi } from '../services/api';
import { Incident } from '../types';
import { AlertTriangle, User, Bus, CheckCircle, ExternalLink } from 'lucide-react';

const Incidents: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mosApi.getIncidents().then(data => {
      setIncidents(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Incident Reports</h1>
          <p className="text-slate-500 font-medium">Manage and resolve operational disruptions</p>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="p-20 text-center text-slate-400">Loading incidents...</div>
        ) : incidents.map(incident => (
          <div key={incident.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:border-red-200 transition-all group">
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 uppercase">{incident.type.replace('_', ' ')}</h3>
                    <p className="text-sm text-slate-500 font-medium">Reported {new Date(incident.timestamp).toLocaleString()}</p>
                  </div>
                  <span className={`ml-auto lg:ml-0 px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                    incident.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {incident.status}
                  </span>
                </div>
                
                <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  "{incident.description}"
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Bus size={14} /> {incident.vehicleId}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <User size={14} /> {incident.crewId}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <ExternalLink size={14} /> Segment {incident.segmentId}
                  </div>
                </div>
              </div>

              <div className="flex flex-row lg:flex-col gap-2 min-w-[150px] justify-center">
                <button className="flex-1 lg:flex-none px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                  <CheckCircle size={18} /> Resolve
                </button>
                <button className="flex-1 lg:flex-none px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">
                  Escalate
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Incidents;
