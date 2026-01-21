
import React, { useEffect, useState, useMemo } from 'react';
import { mosApi, mosWs } from '../services/api';
import { Crew, Branch } from '../types';
import { User, MoreVertical, X, Plus, Trash2, Settings, ShieldCheck, RefreshCw } from 'lucide-react';

interface CrewPageProps {
  searchQuery?: string;
}

const CrewPage: React.FC<CrewPageProps> = ({ searchQuery = '' }) => {
  const [crew, setCrew] = useState<Crew[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCrew, setEditingCrew] = useState<Crew | null>(null);
  const [formData, setFormData] = useState({ name: '', role: 'DRIVER' as any, branchId: '', status: 'AVAILABLE' as any });

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true); else setIsRefreshing(true);
    try {
      const [c, b] = await Promise.all([mosApi.getCrew(), mosApi.getBranches()]);
      setCrew(c);
      setBranches(b);
    } catch (err) {
      console.error("Crew sync failure:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for real-time status updates from the database
    const unsubCrew = mosWs.on('CREW_UPDATED', () => fetchData(true));
    
    return () => {
      unsubCrew();
    };
  }, []);

  const filteredCrew = useMemo(() => {
    return crew.filter(c => {
      const branchName = branches.find(b => b.id === c.branchId)?.name || '';
      return c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
             branchName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [crew, searchQuery, branches]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingCrew) {
        await mosApi.updateCrew(editingCrew.id, formData);
      } else {
        await mosApi.createCrew(formData);
      }
      setShowModal(false);
      await fetchData();
    } catch (err: any) {
      alert(`Personnel induction failed: ${err.message}. Ensure connectivity to the Lync Kernel.`);
    } finally {
      setIsSaving(false);
    }
  };

  const openEdit = (c: Crew) => {
    setEditingCrew(c);
    setFormData({ name: c.name, role: c.role, branchId: c.branchId, status: c.status });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Remove this crew member from the active database? History will be archived.")) return;
    await mosApi.deleteCrew(id);
    fetchData();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            Personnel Core {(loading || isRefreshing) && <RefreshCw size={24} className="text-blue-500 animate-spin" />}
          </h1>
          <p className="text-slate-500 font-medium mt-1">Real-time performance and trust scoring for drivers and conductors</p>
        </div>
        <button 
          onClick={() => { setEditingCrew(null); setFormData({ name: '', role: 'DRIVER', branchId: branches[0]?.id || '', status: 'AVAILABLE' }); setShowModal(true); }}
          className="bg-blue-600 text-white px-8 py-3.5 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30 active:scale-95 flex items-center gap-3"
        >
          <Plus size={20} /> Register Personnel
        </button>
      </div>

      <div className="bg-white rounded-[40px] shadow-[0_30px_60px_rgba(0,0,0,0.03)] border border-slate-100/80 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name & Designation</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operating Hub</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Integrity Score</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50">
            {loading && crew.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-20 text-slate-400 font-black uppercase tracking-widest text-xs">Accessing Distributed Personnel Data...</td></tr>
            ) : filteredCrew.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-20 text-slate-400 font-medium">{searchQuery ? `No personnel matching "${searchQuery}"` : "No personnel found."}</td></tr>
            ) : filteredCrew.map(c => (
              <tr key={c.id} className="hover:bg-slate-50/50 transition-all duration-300 group">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-[18px] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-slate-900/10 border border-slate-800 transition-transform group-hover:scale-110">{c.name.charAt(0)}</div>
                    <div>
                      <p className="font-black text-slate-900 text-lg tracking-tight">{c.name}</p>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{c.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-6 text-sm text-slate-600 font-black uppercase tracking-widest">{branches.find(b => b.id === c.branchId)?.name || 'Central'}</td>
                <td className="px-10 py-6">
                  <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors ${
                    c.status === 'ASSIGNED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm' : 
                    c.status === 'AVAILABLE' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                    'bg-slate-50 text-slate-400 border-slate-100'
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-10 py-6 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                    <ShieldCheck size={14} className={c.trustScore > 90 ? 'text-emerald-500' : 'text-amber-500'} />
                    <span className={`text-sm font-black ${c.trustScore > 90 ? 'text-emerald-600' : 'text-amber-600'}`}>{c.trustScore}%</span>
                  </div>
                </td>
                <td className="px-10 py-6 text-right">
                   <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button onClick={() => openEdit(c)} className="p-2.5 bg-white border border-slate-100 rounded-xl hover:shadow-lg text-slate-400 hover:text-slate-900"><Settings size={18} /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-2.5 bg-white border border-slate-100 rounded-xl hover:shadow-lg text-slate-300 hover:text-red-500"><Trash2 size={18} /></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[48px] w-full max-w-lg shadow-[0_40px_100px_rgba(0,0,0,0.2)] animate-in zoom-in duration-300 overflow-hidden border border-white">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{editingCrew ? 'Update Identity' : 'Personnel Induction'}</h2>
                <p className="text-slate-500 font-medium">Configure credentials and operational scope</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-4 hover:bg-white rounded-full transition-all shadow-sm"><X size={24} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Legal Full Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[28px] font-black text-xl tracking-tight focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-inner" placeholder="E.G. PETER PARKER" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Designated Role</label>
                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})} className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[28px] font-black text-sm outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer shadow-inner">
                      <option value="DRIVER">DRIVER</option>
                      <option value="CONDUCTOR">CONDUCTOR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Initial Status</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[28px] font-black text-sm outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer shadow-inner">
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="ASSIGNED">ASSIGNED</option>
                      <option value="OFF-DUTY">OFF-DUTY</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Assigned Hub Node</label>
                  <select required value={formData.branchId} onChange={e => setFormData({...formData, branchId: e.target.value})} className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[28px] font-black text-sm outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer shadow-inner">
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full py-6 bg-blue-600 text-white rounded-[32px] font-black text-lg uppercase tracking-widest hover:bg-blue-700 transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)] active:scale-95 disabled:opacity-50"
              >
                {isSaving ? 'Processing Kernel Commit...' : (editingCrew ? 'Commit Identity Update' : 'Initialize Personnel Node')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrewPage;
