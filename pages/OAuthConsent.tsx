
import React, { useState } from 'react';
import { ShieldCheck, Zap, Lock, Info, Check, X, ArrowRight, ExternalLink } from 'lucide-react';

const OAuthConsent: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const permissions = [
    { id: 'trips.read', label: 'View active trips and segments', desc: 'Allows the app to read real-time logistics data.' },
    { id: 'revenue.read', label: 'Access financial summaries', desc: 'Allows viewing of branch revenue and trust scores.' },
    { id: 'crew.read', label: 'View personnel records', desc: 'Allows the app to see driver and conductor details.' },
  ];

  const handleAuthorize = () => {
    setLoading(true);
    // Simulate authorization logic
    setTimeout(() => {
      window.location.href = 'https://lyncapp.io/auth/callback?code=mock_auth_code_2025';
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden antialiased">
      {/* Visual background dynamics */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[160px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-900/10 rounded-full blur-[160px]" />

      <div className="w-full max-w-[540px] z-10">
        <div className="flex flex-col items-center mb-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="w-16 h-16 bg-blue-600 rounded-[24px] flex items-center justify-center shadow-2xl shadow-blue-600/40 mb-6 group hover:scale-110 transition-transform">
            <Zap className="text-white" size={32} fill="white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Authorization Request</h1>
          <div className="mt-3 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center gap-2">
            <ShieldCheck size={14} className="text-blue-400" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Lync Security Protocol</span>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-3xl border border-slate-800 rounded-[48px] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500">
          <div className="p-10">
            <div className="flex items-center gap-5 mb-10">
              <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 shadow-inner">
                <ExternalLink className="text-slate-500" size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-black text-white">Lync Terminal <span className="text-slate-500 font-medium">v2.4</span></h2>
                <p className="text-sm text-slate-400">is requesting access to your SACCO dashboard.</p>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Permissions Requested</p>
              
              <div className="space-y-4">
                {permissions.map((perm) => (
                  <div key={perm.id} className="group p-5 bg-slate-950/40 border border-slate-800 rounded-[28px] flex items-start gap-4 hover:border-blue-500/30 transition-all duration-300">
                    <div className="mt-1 p-1 bg-blue-500/10 rounded-lg text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Check size={14} strokeWidth={4} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-100 mb-1">{perm.label}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">{perm.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 p-5 bg-amber-500/5 border border-amber-500/10 rounded-3xl flex items-start gap-4">
              <Info className="text-amber-500 shrink-0 mt-0.5" size={18} />
              <p className="text-[11px] text-amber-500/80 leading-relaxed font-bold uppercase tracking-tight">
                Authorize only if you trust this application. Access can be revoked anytime via the SACCO Control Panel.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/40 p-8 border-t border-slate-800 flex items-center gap-4">
            <button 
              onClick={() => window.history.back()}
              className="flex-1 py-5 bg-transparent border border-slate-800 text-slate-400 rounded-[28px] font-black text-xs uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <X size={16} /> Cancel
            </button>
            <button 
              onClick={handleAuthorize}
              disabled={loading}
              className="flex-[1.5] py-5 bg-blue-600 text-white rounded-[28px] font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Allow Access <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
            <Lock size={12} /> SSL Secure 256-bit
          </div>
          <div className="w-1 h-1 bg-slate-800 rounded-full" />
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
            Privacy Policy
          </div>
        </div>
      </div>
    </div>
  );
};

export default OAuthConsent;
