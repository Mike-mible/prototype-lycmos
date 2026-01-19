
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Trips from './pages/Trips';
import Vehicles from './pages/Vehicles';
import Branches from './pages/Branches';
import CrewPage from './pages/Crew';
import SMSTickets from './pages/SMSTickets';
import Incidents from './pages/Incidents';
import RevenueAnalytics from './pages/RevenueAnalytics';
import { mosWs } from './services/api';
import { Bell, Search, User, Zap, ZapOff, Info, X } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success';
}

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [wsConnected, setWsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    mosWs.connect();
    const unsubStatus = mosWs.onStatusChange(setWsConnected);

    const addNotification = (data: any) => {
      const id = Math.random().toString(36).substring(7);
      // Fix: Use 'as const' to ensure 'info' is treated as a literal type, satisfying the Notification interface
      setNotifications(prev => [{ id, message: data.message || 'System update received', type: 'info' as const }, ...prev].slice(0, 3));
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
    };

    const unsubSegment = mosWs.on('SEGMENT_UPDATED', addNotification);
    const unsubRevenue = mosWs.on('REVENUE_DECLARED', addNotification);
    const unsubTickets = mosWs.on('NEW_SMS_TICKET', addNotification);

    return () => {
      unsubStatus();
      unsubSegment();
      unsubRevenue();
      unsubTickets();
    };
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'trips': return <Trips />;
      case 'vehicles': return <Vehicles />;
      case 'branches': return <Branches />;
      case 'crew': return <CrewPage />;
      case 'sms': return <SMSTickets />;
      case 'incidents': return <Incidents />;
      case 'revenue': return <RevenueAnalytics />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <main 
        className={`flex-1 flex flex-col min-w-0 h-full transition-all duration-300 relative ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Global Real-time Notifications */}
        <div className="fixed top-24 right-8 z-[100] flex flex-col gap-3">
          {notifications.map(n => (
            <div key={n.id} className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4 min-w-[300px] animate-in slide-in-from-right duration-300">
              <div className="p-2 bg-blue-600 rounded-xl">
                <Info size={18} />
              </div>
              <p className="text-sm font-bold flex-1">{n.message}</p>
              <button onClick={() => setNotifications(p => p.filter(x => x.id !== n.id))} className="text-slate-500 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-lg font-bold text-slate-800 capitalize">{activePage.replace('-', ' ')}</h2>
            {wsConnected ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
                <Zap size={10} fill="currentColor" /> Live
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-100">
                <ZapOff size={10} /> Connecting
              </span>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Global search..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm w-64"
              />
            </div>
            <button className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 relative hover:bg-slate-100 transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            <button className="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-3 rounded-xl transition-all">
              <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
                <User size={20} className="text-slate-600" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-bold text-slate-900">Admin User</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Super Admin</p>
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {renderPage()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
