
import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Map, 
  MapPin, 
  Bus, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  X,
  ShieldCheck,
  Zap,
  Users
} from 'lucide-react';
import { OnboardingData } from '../types';

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

const steps = [
  { id: 1, title: 'Profile', icon: Building2 },
  { id: 2, title: 'Routes', icon: Map },
  { id: 3, title: 'Branches', icon: MapPin },
  { id: 4, title: 'Fleet', icon: Bus },
  { id: 5, title: 'Review', icon: ShieldCheck },
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    saccoName: '',
    registrationNumber: '',
    contactEmail: '',
    routes: [''],
    branches: [{ name: '', location: '' }],
    vehicles: [{ plate: '', capacity: 14 }]
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const updateField = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayUpdate = (field: 'routes' | 'branches' | 'vehicles', index: number, value: any) => {
    setData(prev => {
      const newArr = [...prev[field]] as any[];
      newArr[index] = value;
      return { ...prev, [field]: newArr };
    });
  };

  const addArrayItem = (field: 'routes' | 'branches' | 'vehicles') => {
    setData(prev => {
      const newItem = field === 'routes' ? '' : (field === 'branches' ? { name: '', location: '' } : { plate: '', capacity: 14 });
      return { ...prev, [field]: [...prev[field], newItem] };
    });
  };

  const removeArrayItem = (field: 'routes' | 'branches' | 'vehicles', index: number) => {
    if (data[field].length <= 1) return;
    setData(prev => {
      const newArr = [...prev[field]] as any[];
      newArr.splice(index, 1);
      return { ...prev, [field]: newArr };
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">SACCO Identity</h2>
              <p className="text-slate-500 mt-2 font-medium">Initialize your official business credentials</p>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Official Brand Name</label>
                <input 
                  type="text"
                  value={data.saccoName}
                  onChange={(e) => updateField('saccoName', e.target.value)}
                  placeholder="E.G. UNIFIED TRANSIT SACCO"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[20px] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-lg shadow-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Registration No.</label>
                  <input 
                    type="text"
                    value={data.registrationNumber}
                    onChange={(e) => updateField('registrationNumber', e.target.value)}
                    placeholder="CS/2023/001"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[20px] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Operations Email</label>
                  <input 
                    type="email"
                    value={data.contactEmail}
                    onChange={(e) => updateField('contactEmail', e.target.value)}
                    placeholder="ADMIN@SACCO.CO.KE"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[20px] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Main Corridors</h2>
              <p className="text-slate-500 mt-2 font-medium">Define your primary operational routes</p>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto px-1 pr-3 scrollbar-hide">
              {data.routes.map((route, idx) => (
                <div key={idx} className="flex gap-3 group">
                  <input 
                    type="text"
                    value={route}
                    onChange={(e) => handleArrayUpdate('routes', idx, e.target.value)}
                    placeholder="NAIROBI - MOMBASA"
                    className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold group-focus-within:border-blue-500 transition-all shadow-sm"
                  />
                  <button onClick={() => removeArrayItem('routes', idx)} className="p-4 text-slate-300 hover:text-red-500 transition-colors"><X size={20}/></button>
                </div>
              ))}
              <button onClick={() => addArrayItem('routes')} className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest hover:text-blue-700 transition-all py-4 px-6 bg-blue-50/50 rounded-2xl border border-dashed border-blue-200 w-full justify-center">
                <Plus size={16} /> Add another route
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Operational Hubs</h2>
              <p className="text-slate-500 mt-2 font-medium">Register branches for localized revenue tracking</p>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto px-1 pr-3">
              {data.branches.map((branch, idx) => (
                <div key={idx} className="p-6 bg-slate-50 border border-slate-200 rounded-[32px] relative group hover:border-blue-200 transition-all shadow-sm">
                  <button onClick={() => removeArrayItem('branches', idx)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"><X size={18}/></button>
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text"
                      placeholder="HUB NAME"
                      value={branch.name}
                      onChange={(e) => handleArrayUpdate('branches', idx, { ...branch, name: e.target.value })}
                      className="px-4 py-3 bg-white border border-slate-100 rounded-xl outline-none font-bold text-sm focus:border-blue-500 transition-all shadow-inner"
                    />
                    <input 
                      type="text"
                      placeholder="LOCATION"
                      value={branch.location}
                      onChange={(e) => handleArrayUpdate('branches', idx, { ...branch, location: e.target.value })}
                      className="px-4 py-3 bg-white border border-slate-100 rounded-xl outline-none font-bold text-sm focus:border-blue-500 transition-all shadow-inner"
                    />
                  </div>
                </div>
              ))}
              <button onClick={() => addArrayItem('branches')} className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest py-4 px-6 bg-blue-50/50 rounded-2xl border border-dashed border-blue-200 w-full justify-center">
                <Plus size={16} /> Add another branch
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Fleet Initialization</h2>
              <p className="text-slate-500 mt-2 font-medium">Register your first vehicles and their capacities</p>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto px-1 pr-3">
              {data.vehicles.map((v, idx) => (
                <div key={idx} className="flex gap-4 items-center p-2">
                  <div className="flex-[2] px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-4 shadow-sm hover:border-blue-300 transition-all">
                    <Bus size={20} className="text-slate-400" />
                    <input 
                      type="text"
                      placeholder="KCA 123X"
                      value={v.plate}
                      onChange={(e) => handleArrayUpdate('vehicles', idx, { ...v, plate: e.target.value.toUpperCase() })}
                      className="bg-transparent outline-none flex-1 font-black uppercase tracking-widest text-lg"
                    />
                  </div>
                  <div className="flex-1 px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 shadow-sm hover:border-blue-300 transition-all">
                    <Users size={18} className="text-slate-400" />
                    <input 
                      type="number"
                      placeholder="CAP."
                      value={v.capacity}
                      onChange={(e) => handleArrayUpdate('vehicles', idx, { ...v, capacity: parseInt(e.target.value) })}
                      className="bg-transparent outline-none w-full font-bold text-center"
                    />
                  </div>
                  <button onClick={() => removeArrayItem('vehicles', idx)} className="p-3 text-slate-300 hover:text-red-500 transition-colors"><X size={20}/></button>
                </div>
              ))}
              <button onClick={() => addArrayItem('vehicles')} className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest py-4 px-6 bg-blue-50/50 rounded-2xl border border-dashed border-blue-200 w-full justify-center">
                <Plus size={16} /> Add another vehicle
              </button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-600/20 ring-4 ring-blue-50">
                <ShieldCheck size={40} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Confirmation</h2>
              <p className="text-slate-500 mt-2 font-medium">Verify your setup before initializing the Lync Kernel</p>
            </div>
            
            <div className="bg-slate-900 rounded-[32px] p-8 space-y-5 border border-slate-800 shadow-2xl">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Identity</span>
                <span className="font-black text-white">{data.saccoName || 'NOT SET'}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Operations</span>
                <span className="font-black text-white">{data.branches.length} HUBS REGISTERED</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Initial Fleet</span>
                <div className="text-right">
                  <p className="font-black text-white uppercase text-sm">{data.vehicles.length} VEHICLES</p>
                  <p className="text-[10px] text-blue-400 font-bold tracking-widest">REAL-TIME TRACKING ACTIVE</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-blue-600/5 text-blue-700 rounded-3xl text-sm border border-blue-100/50 shadow-inner">
              <Zap size={20} className="shrink-0 mt-1 fill-blue-600" />
              <p className="font-medium leading-relaxed">System logic will initialize the branch network monitors and create initial segment routes automatically.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 selection:bg-blue-100">
      <div className="w-full max-w-2xl">
        {/* Modern Progress Tracker */}
        <div className="mb-16 flex justify-between items-center px-8 relative">
           <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-200 -translate-y-1/2 rounded-full overflow-hidden">
             <div 
               className="h-full bg-blue-600 transition-all duration-700 ease-out shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
               style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
             />
           </div>
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center gap-3 relative z-10">
              <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center border-4 transition-all duration-500 shadow-xl ${
                currentStep >= step.id ? 'bg-blue-600 border-blue-50 text-white' : 'bg-white border-white text-slate-300'
              }`}>
                {currentStep > step.id ? <CheckCircle2 size={24} /> : <step.icon size={24} />}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${currentStep >= step.id ? 'text-blue-600' : 'text-slate-400'}`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>

        {/* Content Premium Card */}
        <div className="bg-white rounded-[48px] shadow-[0_40px_100px_rgba(0,0,0,0.06)] border border-white overflow-hidden backdrop-blur-sm">
          <div className="p-12 min-h-[500px] flex flex-col justify-center">
            {renderStep()}
          </div>
          
          <div className="bg-slate-50/80 p-8 flex justify-between items-center border-t border-slate-100">
            <button 
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-3 px-6 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all rounded-2xl ${
                currentStep === 1 ? 'opacity-0 cursor-default' : 'text-slate-400 hover:text-slate-900 hover:bg-white shadow-sm'
              }`}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button 
              onClick={currentStep === steps.length ? () => onComplete(data) : nextStep}
              className="flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-[24px] text-sm font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all active:scale-95 shadow-2xl shadow-slate-900/20"
            >
              {currentStep === steps.length ? 'Finalize Setup' : 'Continue'} <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <p className="text-center mt-12 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
          LyncApp Business Systems • Kernel v1.0 • Encrypted Tunnel Active
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
