
import React, { useEffect, useState, useMemo } from 'react';
import { mosApi } from '../services/api';
import { Branch } from '../types';
import { MapPin, User, Plus, Trash2, X, Settings, RefreshCw } from 'lucide-react';

interface BranchesProps {
  searchQuery?: string;
}

const Branches: React.FC<BranchesProps> = ({ searchQuery = '' }) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({ name: '', location: '', manager: '' });

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const data = await mosApi.getBranches();
      setBranches(data);
    } catch (err) {
      console.error("Hub fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBranches(); }, []);

  const filteredBranches = useMemo(() => {
    return branches.filter(b => 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [branches, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingBranch) {
        await mosApi.updateBranch(editingBranch.id, formData);
      } else {
        await mosApi.createBranch(formData);
      }
      setShowModal(false);
      setEditingBranch(null);
      setFormData({ name: '', location: '', manager: '' });
      await fetchBranches();
    } catch (err: any) {
      alert(`Hub initialization failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const openEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({ name: branch.name, location: branch.location, manager: branch.manager });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure you want to delete this branch? Operational data linked to it may be affected.")) return;
    await mosApi.deleteBranch(id);
    fetchBranches();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            Hub Network {loading && <RefreshCw size={24} className="text-blue-500 animate-spin" />}
          </h1>
          <p className="text-slate-500 font-medium mt-1">Global management of regional operational nodes</p>
        </div>
        <button 
          onClick={() => { setEditingBranch(null); setFormData({ name: '', location: '', manager: '' }); setShowModal(true); }}
          className="bg-blue-600 text-white px-8 py-3.5 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30 active:scale-95 flex items-center gap-3"
        >
          <Plus size={20} /> Register Hub
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading && branches.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400 font-black uppercase tracking-widest">Accessing Node Registry...</div>
        ) : filteredBranches.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400 bg-white border rounded-[40px]">
            {searchQuery ? `No hubs matching "${searchQuery}"` : "No hubs found in system logic."}
          </div>
        ) : filteredBranches.map(branch => (
          <div key={branch.id} className="bg-white p-8 rounded-[40px] border border-slate-100/80 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_100px_rgba(0,0,0,0.06)] transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-bl-[60px] translate-x-12 -translate-y-12 group-hover:translate-x-0 group-hover:-translate-y-0 transition-all duration-500" />
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-[20px] shadow-inner border border-blue-100/50">
                <MapPin size={28} />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button onClick={() => openEdit(branch)} className="p-2.5 bg-white shadow-lg rounded-xl text-slate-400 hover:text-slate-900 border border-slate-100 transition-all"><Settings size={18} /></button>
                <button onClick={() => handleDelete(branch.id)} className="p-2.5 bg-white shadow-lg rounded-xl text-slate-300 hover:text-red-500 border border-slate-100 transition-all"><Trash2 size={18} /></button>
              </div>
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{branch.name}</h3>
            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">{branch.location}</p>
            
            <div className="mt-10 pt-8 border-t border-slate-50 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <User size={14} className="text-blue-500" /> Managing Director
                </span>
                <span className="font-black text-slate-900">{branch.manager}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                   Live Status
                </span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-black text-[8px] uppercase tracking-widest border border-emerald-100">Synchronized</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[48px] w-full max-w-lg shadow-[0_40px_100px_rgba(0,0,0,0.2)] animate-in zoom-in duration-300 overflow-hidden border border-white">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{editingBranch ? 'Update Node' : 'New Hub Node'}</h2>
                <p className="text-slate-500 font-medium">Configure operational parameters</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-4 hover:bg-white rounded-full transition-all shadow-sm"><X size={24} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Node Identifier</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[28px] font-black text-xl tracking-tight focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-inner" placeholder="E.G. NAIROBI CENTRAL" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Geographic Location</label>
                  <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[28px] font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-inner" placeholder="E.G. TOM MBOYA ST" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Assigned Manager</label>
                  <input required value={formData.manager} onChange={e => setFormData({...formData, manager: e.target.value})} className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[28px] font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-inner" placeholder="E.G. JANE DOE" />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full py-6 bg-blue-600 text-white rounded-[32px] font-black text-lg uppercase tracking-widest hover:bg-blue-700 transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)] active:scale-95 disabled:opacity-50"
              >
                {isSaving ? 'Synching Hub Records...' : (editingBranch ? 'Sync Node Update' : 'Initialize Hub Node')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
