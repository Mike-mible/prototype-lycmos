
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Trips from './pages/Trips';
import Vehicles from './pages/Vehicles';
import Branches from './pages/Branches';
import CrewPage from './pages/Crew';
import SMSTickets from './pages/SMSTickets';
import Incidents from './pages/Incidents';
import RevenueAnalytics from './pages/RevenueAnalytics';
import Onboarding from './pages/Onboarding';
import Auth from './pages/Auth';
import OAuthConsent from './pages/OAuthConsent';
import { mosWs } from './services/api';
import { supabase } from './services/supabase';
import { Bell, Search, User, Zap, ZapOff, Info, X, LogOut, Settings, HelpCircle, ChevronRight } from 'lucide-react';
import { OnboardingData } from './types';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: Date;
}

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [wsConnected, setWsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  
  const [session, setSession] = useState<any>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // Path detection for specific routes like /oauth/consent
  const currentPath = window.location.pathname;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        const isCompleted = localStorage.getItem('lync_onboarding_completed') === 'true';
        setOnboardingCompleted(isCompleted);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        const isCompleted = localStorage.getItem('lync_onboarding_completed') === 'true';
        setOnboardingCompleted(isCompleted);
      }
    });

    mosWs.connect();
    const unsubStatus = mosWs.onStatusChange(setWsConnected);

    const addNotification = (data: any) => {
      const id = Math.random().toString(36).substring(7);
      const newNotif: Notification = { 
        id, 
        message: data.message || 'System update received', 
        type: data.type || 'info',
        timestamp: new Date()
      };
      setNotifications(prev => [newNotif, ...prev]);
    };

    const unsubSegment = mosWs.on('SEGMENT_UPDATED', addNotification);
    const unsubRevenue = mosWs.on('REVENUE_DECLARED', addNotification);
    const unsubTickets = mosWs.on('NEW_SMS_TICKET', addNotification);

    return () => {
      subscription.unsubscribe();
      unsubStatus();
      unsubSegment();
      unsubRevenue();
      unsubTickets();
    };
  }, []);

  const handleOnboardingComplete = (data: OnboardingData) => {
    localStorage.setItem('lync_onboarding_completed', 'true');
    localStorage.setItem('lync_sacco_name', data.saccoName);
    setOnboardingCompleted(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setShowProfileMenu(false);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'trips': return <Trips searchQuery={searchQuery} />;
      case 'vehicles': return <Vehicles searchQuery={searchQuery} />;
      case 'branches': return <Branches searchQuery={searchQuery} />;
      case 'crew': return <CrewPage searchQuery={searchQuery} />;
      case 'sms': return <SMSTickets searchQuery={searchQuery} />;
      case 'incidents': return <Incidents searchQuery={searchQuery} />;
      case 'revenue': return <RevenueAnalytics />;
      default: return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center antialiased">
        <div className="relative">
          <div className="w-16 h-16 border-[3px] border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
          <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 animate-pulse" size={24} fill="currentColor" />
        </div>
        <p className="mt-8 text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">Kernel Synchronizing</p>
      </div>
    );
  }

  // Handle specialized paths first
  if (currentPath === '/oauth/consent') {
    return <OAuthConsent />;
  }

  if (!session) return <Auth onSession={setSession} />;
  if (!onboardingCompleted) return <Onboarding onComplete={handleOnboardingComplete} />;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans selection:bg-blue-600/10 antialiased text-slate-900">
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onLogout={handleLogout}
      />
      
      <main className={`flex-1 flex flex-col min-w-0 h-full transition-all duration-500 ease-in-out relative ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Real-time Toast Overlay */}
        <div className="fixed top-24 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
          {notifications.slice(0, 3).map(n => (
            <div key={n.id} className="pointer-events-auto bg-slate-900/95 backdrop-blur-xl text-white p-5 rounded-[24px] shadow-[0_30px_60px_rgba(0,0,0,0.25)] border border-slate-700/50 flex items-center gap-4 min-w-[320px] animate-in slide-in-from-right-8 duration-500">
              <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/30">
                <Zap size={18} fill="white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black leading-tight tracking-tight">{n.message}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Just Now • Realtime Uplink</p>
              </div>
              <button onClick={() => setNotifications(p => p.filter(x => x.id !== n.id))} className="text-slate-500 hover:text-white transition-colors p-1">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* High-Fidelity Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-6 flex-1">
            <div>
              <h2 className="text-xl font-black text-slate-900 capitalize tracking-tight">{activePage.replace('-', ' ')}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                {wsConnected ? (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live Node
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-full">
                    <ZapOff size={8} /> Offline
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative group hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across kernel..." 
                className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-bold w-72 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
                className={`p-3 rounded-2xl transition-all relative group ${showNotificationDrawer ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-100' : 'bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100'}`}
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-bounce shadow-sm" />
                )}
              </button>
            </div>

            <div className="h-10 w-px bg-slate-200 mx-2"></div>
            
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 hover:bg-slate-50 p-1 rounded-2xl transition-all active:scale-95"
              >
                <div className="w-10 h-10 bg-slate-900 rounded-[14px] flex items-center justify-center text-white font-black text-xs shadow-xl shadow-slate-900/10">
                  {session.user?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
              </button>
              
              {showProfileMenu && (
                <div className="absolute top-14 right-0 w-64 bg-white rounded-[32px] shadow-[0_40px_80px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 z-50 p-2">
                   <div className="p-4 border-b border-slate-50 mb-1">
                     <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated As</p>
                     <p className="text-sm font-black text-slate-900 truncate">{session.user?.email}</p>
                   </div>
                   <div className="space-y-1">
                     <button className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors text-slate-600 font-bold text-sm">
                       <Settings size={18} /> Account Settings
                     </button>
                     <button className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors text-slate-600 font-bold text-sm">
                       <HelpCircle size={18} /> System Help
                     </button>
                     <div className="h-px bg-slate-50 mx-3 my-1"></div>
                     <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-red-50 transition-colors text-red-500 font-black text-sm">
                       <LogOut size={18} /> Sign Out Terminal
                     </button>
                   </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto pb-20">
            {renderPage()}
          </div>
        </div>
      </main>

      {/* Dynamic Overlay for App Menu State */}
      {(showProfileMenu || showNotificationDrawer) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => { setShowProfileMenu(false); setShowNotificationDrawer(false); }}
        />
      )}
    </div>
  );
};

export default App;
