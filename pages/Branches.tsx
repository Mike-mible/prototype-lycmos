
import React, { useEffect, useState } from 'react';
import { mosApi } from '../services/api';
import { Branch } from '../types';
import { MapPin, User, Plus, MoreHorizontal, X } from 'lucide-react';

const Branches: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({ name: '', location: '', manager: '' });

  const fetchBranches = () => mosApi.getBranches().then(setBranches);

  useEffect(() => { fetchBranches(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBranch) {
      await mosApi.updateBranch(editingBranch.id, formData);
    } else {
      await mosApi.createBranch(formData);
    }
    setShowModal(false);
    setEditingBranch(null);
    setFormData({ name: '', location: '', manager: '' });
    fetchBranches();
  };

  const openEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({ name: branch.name, location: branch.location, manager: branch.manager });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sacco Branches</h1>
          <p className="text-slate-500 font-medium">Regional operational centers and management</p>
        </div>
        <button 
          onClick={() => { setEditingBranch(null); setFormData({ name: '', location: '', manager: '' }); setShowModal(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all"
        >
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
              <button onClick={() => openEdit(branch)} className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={20} /></button>
            </div>
            <h3 className="text-xl font-bold text-slate-900">{branch.name}</h3>
            <p className="text-sm text-slate-500 mt-1">{branch.location}</p>
            
            <div className="mt-6 pt-6 border-t border-slate-50 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 flex items-center gap-2"><User size={14} /> Manager</span>
                <span className="font-bold text-slate-700">{branch.manager}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">{editingBranch ? 'Edit' : 'New'} Branch</h2>
              <button onClick={() => setShowModal(false)}><X size={24} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Branch Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border rounded-xl" placeholder="e.g., Nairobi Central" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Location</label>
                <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border rounded-xl" placeholder="e.g., Tom Mboya St" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Manager Name</label>
                <input required value={formData.manager} onChange={e => setFormData({...formData, manager: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border rounded-xl" placeholder="e.g., Jane Doe" />
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
                {editingBranch ? 'Save Changes' : 'Create Branch'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
