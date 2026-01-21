
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Mail, Lock, LogIn, UserPlus, ShieldCheck, ArrowRight, Zap, AlertCircle } from 'lucide-react';

interface AuthProps {
  onSession: (session: any) => void;
}

const Auth: React.FC<AuthProps> = ({ onSession }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
        onSession(data.session);
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: 'SACCO_ADMIN',
            },
          },
        });
        if (authError) throw authError;
        if (data.user && !data.session) {
          setError("Verification email sent! Please check your inbox.");
        } else {
          onSession(data.session);
        }
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Brand background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
      
      <div className="w-full max-w-[480px] z-10">
        <div className="flex flex-col items-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-16 h-16 bg-blue-600 rounded-[22px] flex items-center justify-center shadow-2xl shadow-blue-600/30 mb-6">
            <Zap className="text-white" size={32} fill="white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">LyncApp</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Business Kernel v1.0</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800 rounded-[40px] p-10 shadow-2xl animate-in zoom-in duration-500">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-white">{isLogin ? 'Admin Sign In' : 'Initialize Account'}</h2>
            <p className="text-slate-400 text-sm mt-1">Secure access to SACCO operations</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Control Email</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@sacco.co.ke"
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 rounded-2xl py-4 pl-14 pr-6 text-white font-bold outline-none transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Secure Passkey</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 rounded-2xl py-4 pl-14 pr-6 text-white font-bold outline-none transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                <AlertCircle className="text-red-500 shrink-0" size={18} />
                <p className="text-red-500 text-xs font-bold leading-tight">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-[24px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Access Dashboard' : 'Create Admin Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex flex-col gap-4">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-center text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
            
            <div className="h-px bg-slate-800/50 w-full" />
            
            <div className="flex items-center justify-center gap-2 text-slate-600">
              <ShieldCheck size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">AES-256 Encrypted Protocol</span>
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-slate-700 text-[10px] font-black uppercase tracking-[0.4em]">
          Lync Systems • Multi-tenant Cloud
        </p>
      </div>
    </div>
  );
};

export default Auth;
