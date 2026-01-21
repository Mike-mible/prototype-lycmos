
import React, { useEffect, useState, useMemo } from 'react';
import { mosApi } from '../services/api';
import { Vehicle, Branch } from '../types';
import { Bus, Settings, MoreVertical, Search, Plus, X, Users, Trash2, RefreshCw } from 'lucide-react';

interface VehiclesProps {
  searchQuery?: string;
}

const Vehicles: React.FC<VehiclesProps> = ({ searchQuery = '' }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({ plate: '', branchId: '', capacity: 14, status: 'ACTIVE' as any });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [v, b] = await Promise.all([mosApi.getVehicles(), mosApi.getBranches()]);
      setVehicles(v);
      setBranches(b);
    } catch (err) {
      console.error("Fleet sync failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const branchName = branches.find(b => b.id === v.branchId)?.name || '';
      return v.plate.toLowerCase().includes(searchQuery.toLowerCase()) || 
             branchName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [vehicles, searchQuery, branches]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingVehicle) {
        await mosApi.updateVehicle(editingVehicle.id, formData);
      } else {
        await mosApi.createVehicle(formData);
      }
      setShowModal(false);
      await fetchData();
    } catch (err: any) {
      alert(`Asset registration failed: ${err.message}. Ensure database connection is active.`);
    } finally {
      setIsSaving(false);
    }
  };

  const openEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setFormData({ plate: v.plate, branchId: v.branchId, capacity: v.capacity || 14, status: v.status });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Decommission this vehicle from the active fleet?")) return;
    await mosApi.deleteVehicle(id);
    fetchData();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            Vehicle Fleet {loading && <RefreshCw size={24} className="text-blue-500 animate-spin" />}
          </h1>
          <p className="text-slate-500 font-medium mt-1">Real-time status and capacity monitoring for your matatu network</p>
        </div>
        <button 
          onClick={() => { setEditingVehicle(null); setFormData({ plate: '', branchId: branches[0]?.id || '', capacity: 14, status: 'ACTIVE' }); setShowModal(true); }}
          className="bg-blue-600 text-white px-8 py-3.5 rounded-[24px] font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30 active:scale-95"
        >
          <Plus size={20} /> Add Vehicle
        </button>
      </div>

      <div className="bg-white rounded-[40px] shadow-[0_30px_60px_rgba(0,0,0,0.03)] border border-slate-100/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset ID</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Node</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Seating</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trust</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {loading && vehicles.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-20 text-slate-400 font-black uppercase tracking-widest text-xs">Syncing Distributed Fleet...</td></tr>
              ) : filteredVehicles.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-20 text-slate-400 font-medium">{searchQuery ? `No assets matching "${searchQuery}"` : "No assets registered."}</td></tr>
              ) : filteredVehicles.map(v => (
                <tr key={v.id} className="hover:bg-slate-50/50 transition-all duration-300 group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm group-hover:border-blue-200 transition-all shadow-inner"><Bus className="text-slate-600 group-hover:text-blue-600" size={20} /></div>
                      <span className="font-black text-slate-900 tracking-[0.2em] uppercase text-lg">{v.plate}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 font-black text-sm text-slate-600 tracking-tight uppercase">{branches.find(b => b.id === v.branchId)?.name || 'Central'}</td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2 text-slate-700 font-black text-sm">
                      <Users size={16} className="text-slate-400" />
                      <span>{v.capacity || 14} <span className="text-[9px] text-slate-400 font-black">ST</span></span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      v.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                      v.status === 'IDLE' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 w-24 bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner">
                        <div className={`h-full transition-all duration-1000 ${v.trustScore > 80 ? 'bg-blue-600' : 'bg-amber-500'}`} style={{ width: `${v.trustScore}%` }}></div>
                      </div>
                      <span className="text-[10px] font-black text-slate-900">{v.trustScore}%</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex justify-end gap-2">
                       <button onClick={() => openEdit(v)} className="p-3 bg-white border border-slate-100 rounded-xl hover:shadow-lg transition-all active:scale-95 text-slate-400 hover:text-slate-900"><Settings size={18} /></button>
                       <button onClick={() => handleDelete(v.id)} className="p-3 bg-white border border-slate-100 rounded-xl hover:shadow-lg transition-all active:scale-95 text-slate-300 hover:text-red-500"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[48px] w-full max-w-lg shadow-[0_40px_100px_rgba(0,0,0,0.2)] animate-in zoom-in duration-300 overflow-hidden border border-white">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{editingVehicle ? 'Modify Asset' : 'New Asset Registration'}</h2>
                <p className="text-slate-500 font-medium">Update operational parameters</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-4 hover:bg-white rounded-full transition-all shadow-sm"><X size={24} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Plate Number</label>
                  <input required value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value.toUpperCase()})} className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[28px] font-black uppercase text-2xl tracking-[0.2em] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-inner" placeholder="E.G. KCA 123X" />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Capacity (Seats)</label>
                    <div className="relative">
                      <Users size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="number" required value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})} className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[28px] font-black focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-inner" placeholder="14" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Home Hub Node</label>
                    <select required value={formData.branchId} onChange={e => setFormData({...formData, branchId: e.target.value})} className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[28px] font-black focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none appearance-none transition-all cursor-pointer shadow-inner text-sm uppercase">
                      {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Operating State</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['ACTIVE', 'IDLE', 'MAINTENANCE'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData({...formData, status: s as any})}
                        className={`py-4 rounded-[22px] text-[10px] font-black tracking-widest transition-all border-4 ${
                          formData.status === s 
                          ? 'bg-slate-900 border-slate-900 text-white shadow-2xl' 
                          : 'bg-white border-slate-50 text-slate-300 hover:border-slate-100'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full py-6 bg-blue-600 text-white rounded-[32px] font-black text-lg uppercase tracking-widest hover:bg-blue-700 transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)] active:scale-95 disabled:opacity-50"
              >
                {isSaving ? 'Synching Asset Control...' : (editingVehicle ? 'Sync Core Asset' : 'Finalize Registration')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;
