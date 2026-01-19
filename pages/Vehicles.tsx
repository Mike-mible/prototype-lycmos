
import React, { useEffect, useState } from 'react';
import { mosApi } from '../services/api';
import { Vehicle, Branch } from '../types';
import { Bus, Settings, MoreVertical, Search, Plus, X, Users } from 'lucide-react';

const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({ plate: '', branchId: '', capacity: 14, status: 'ACTIVE' as any });

  const fetchData = async () => {
    setLoading(true);
    const [v, b] = await Promise.all([mosApi.getVehicles(), mosApi.getBranches()]);
    setVehicles(v);
    setBranches(b);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicle) {
      await mosApi.updateVehicle(editingVehicle.id, formData);
    } else {
      await mosApi.createVehicle(formData);
    }
    setShowModal(false);
    fetchData();
  };

  const openEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setFormData({ plate: v.plate, branchId: v.branchId, capacity: v.capacity || 14, status: v.status });
    setShowModal(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Vehicle Fleet</h1>
          <p className="text-slate-500 font-medium mt-1">Real-time status and capacity monitoring for your matatu network</p>
        </div>
        <button 
          onClick={() => { setEditingVehicle(null); setFormData({ plate: '', branchId: branches[0]?.id || '', capacity: 14, status: 'ACTIVE' }); setShowModal(true); }}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30 active:scale-95"
        >
          <Plus size={20} /> Add Vehicle
        </button>
      </div>

      <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.15em]">Matatu Plate</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.15em]">Assigned Hub</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.15em]">Capacity</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.15em]">Status</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.15em]">Performance</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.15em] text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-20 text-slate-400 font-medium italic">Synchronizing fleet data...</td></tr>
              ) : vehicles.map(v => (
                <tr key={v.id} className="hover:bg-slate-50/50 transition-colors group cursor-default">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm group-hover:border-blue-200 transition-all"><Bus className="text-slate-600 group-hover:text-blue-600" size={20} /></div>
                      <span className="font-black text-slate-900 tracking-wider uppercase text-lg">{v.plate}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-bold text-slate-600">{branches.find(b => b.id === v.branchId)?.name || 'Central Hub'}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-slate-700 font-bold">
                      <Users size={16} className="text-slate-400" />
                      <span>{v.capacity || 14} <span className="text-[10px] text-slate-400">SEATER</span></span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                      v.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                      v.status === 'IDLE' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 w-32 bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner">
                        <div className={`h-full transition-all duration-1000 ${v.trustScore > 80 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${v.trustScore}%` }}></div>
                      </div>
                      <span className="text-xs font-black text-slate-900">{v.trustScore}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => openEdit(v)} className="p-3 hover:bg-white hover:shadow-lg border border-transparent hover:border-slate-100 rounded-2xl transition-all"><Settings size={20} className="text-slate-400 group-hover:text-slate-900" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-[0_40px_100px_rgba(0,0,0,0.2)] animate-in zoom-in duration-300 overflow-hidden border border-white">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-slate-900">{editingVehicle ? 'Modify Vehicle' : 'New Registration'}</h2>
                <p className="text-slate-500 text-sm font-medium">Update operational parameters</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-3 hover:bg-white rounded-full transition-all shadow-sm"><X size={24} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Vehicle Identifier (Plate)</label>
                  <input required value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value.toUpperCase()})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black uppercase text-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" placeholder="E.G. KCA 123X" />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Seating Capacity</label>
                    <div className="relative">
                      <Users size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="number" required value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" placeholder="14" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Current Hub</label>
                    <select required value={formData.branchId} onChange={e => setFormData({...formData, branchId: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none appearance-none transition-all cursor-pointer">
                      {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Operational Status</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['ACTIVE', 'IDLE', 'MAINTENANCE'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData({...formData, status: s as any})}
                        className={`py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all border-2 ${
                          formData.status === s 
                          ? 'bg-slate-900 border-slate-900 text-white shadow-xl' 
                          : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/40 active:scale-95">
                {editingVehicle ? 'Sync Modifications' : 'Commit Registration'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;
