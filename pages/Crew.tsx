
import React, { useEffect, useState } from 'react';
import { mosApi } from '../services/api';
import { Crew, Branch } from '../types';
import { User, MoreVertical, X, Plus } from 'lucide-react';

const CrewPage: React.FC = () => {
  const [crew, setCrew] = useState<Crew[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCrew, setEditingCrew] = useState<Crew | null>(null);
  const [formData, setFormData] = useState({ name: '', role: 'DRIVER' as any, branchId: '', status: 'AVAILABLE' as any });

  const fetchData = async () => {
    setLoading(true);
    const [c, b] = await Promise.all([mosApi.getCrew(), mosApi.getBranches()]);
    setCrew(c);
    setBranches(b);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCrew) {
      await mosApi.updateCrew(editingCrew.id, formData);
    } else {
      await mosApi.createCrew(formData);
    }
    setShowModal(false);
    fetchData();
  };

  const openEdit = (c: Crew) => {
    setEditingCrew(c);
    setFormData({ name: c.name, role: c.role, branchId: c.branchId, status: c.status });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Crew Directory</h1>
          <p className="text-slate-500 font-medium">Monitor drivers and conductors performance and trust metrics</p>
        </div>
        <button 
          onClick={() => { setEditingCrew(null); setFormData({ name: '', role: 'DRIVER', branchId: branches[0]?.id || '', status: 'AVAILABLE' }); setShowModal(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all"
        >
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
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10 text-slate-400">Loading crew data...</td></tr>
            ) : crew.map(c => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold border border-slate-200">{c.name.charAt(0)}</div>
                    <div>
                      <p className="font-bold text-slate-900">{c.name}</p>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{c.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-medium">{branches.find(b => b.id === c.branchId)?.name || c.branchId}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                    c.status === 'ASSIGNED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`text-sm font-bold ${c.trustScore > 90 ? 'text-emerald-600' : 'text-amber-600'}`}>{c.trustScore}%</span>
                </td>
                <td className="px-6 py-4 text-right">
                   <button onClick={() => openEdit(c)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"><MoreVertical size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">{editingCrew ? 'Edit' : 'New'} Crew Member</h2>
              <button onClick={() => setShowModal(false)}><X size={24} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border rounded-xl" placeholder="e.g., Peter Parker" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Role</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})} className="w-full px-4 py-2 bg-slate-50 border rounded-xl">
                    <option value="DRIVER">DRIVER</option>
                    <option value="CONDUCTOR">CONDUCTOR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full px-4 py-2 bg-slate-50 border rounded-xl">
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="OFF-DUTY">OFF-DUTY</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Assigned Branch</label>
                <select required value={formData.branchId} onChange={e => setFormData({...formData, branchId: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border rounded-xl">
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
                {editingCrew ? 'Update' : 'Register'} Member
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrewPage;
