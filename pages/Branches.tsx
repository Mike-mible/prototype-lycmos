
import React, { useEffect, useState } from 'react';
import { mosApi } from '../services/api';
import { Branch } from '../types';
import { MapPin, User, Plus, MoreHorizontal } from 'lucide-react';

const Branches: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    mosApi.getBranches().then(setBranches);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sacco Branches</h1>
          <p className="text-slate-500 font-medium">Regional operational centers and management</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2">
          <Plus size={20} /> New Branch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map(branch => (
          <div key={branch.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <MapPin size={24} />
              </div>
              <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={20} /></button>
            </div>
            <h3 className="text-xl font-bold text-slate-900">{branch.name}</h3>
            <p className="text-sm text-slate-500 mt-1">{branch.location}</p>
            
            <div className="mt-6 pt-6 border-t border-slate-50 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 flex items-center gap-2"><User size={14} /> Manager</span>
                <span className="font-bold text-slate-700">{branch.manager}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Active Segments</span>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-md font-bold">12</span>
              </div>
            </div>
            
            <button className="w-full mt-6 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">View Analytics</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Branches;
