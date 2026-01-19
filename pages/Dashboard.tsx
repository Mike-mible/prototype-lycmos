
import React, { useEffect, useState } from 'react';
import { mosApi, mosWs } from '../services/api';
import { DashboardMetrics } from '../types';
import StatCard from '../components/StatCard';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Activity, 
  DollarSign, 
  ShieldCheck, 
  Repeat, 
  Calendar,
  Zap,
  AlertOctagon,
  Terminal
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [kernelTelemetry, setKernelTelemetry] = useState<any>(null);
  const [lastKernelPulse, setLastKernelPulse] = useState<string>('Never');

  const fetchMetrics = () => {
    mosApi.getMetrics().then(setMetrics);
  };

  useEffect(() => {
    fetchMetrics();

    // 1. Initialize the LyncBus on Dashboard page
    const dashboardBus = new BroadcastChannel('LYNC_SYSTEM_BUS');

    // 2. Listen for Real-Time State updates from the Core (Kernel Telemetry)
    dashboardBus.onmessage = (event) => {
      if (event.data.type === 'STATE_UPLINK') {
        const coreState = event.data.payload;
        console.log("Kernel Telemetry Received:", coreState);
        setKernelTelemetry(coreState);
        setLastKernelPulse(new Date().toLocaleTimeString());
        
        // Dynamically update metrics if telemetry contains fresh data
        if (coreState.revenue) {
          setMetrics(prev => prev ? { ...prev, revenueSummary: coreState.revenue } : null);
        }
      }
    };

    // WebSocket listeners for standard data refresh
    const unbindRevenue = mosWs.on('REVENUE_DECLARED', fetchMetrics);
    const unbindSegments = mosWs.on('SEGMENT_UPDATED', fetchMetrics);

    return () => {
      unbindRevenue();
      unbindSegments();
      dashboardBus.close();
    };
  }, []);

  // 3. Send Commands down to the Core
  const triggerEmergency = () => {
    const dashboardBus = new BroadcastChannel('LYNC_SYSTEM_BUS');
    dashboardBus.postMessage({
      type: 'DASHBOARD_COMMAND',
      payload: { action: 'INCIDENT_DECLARED', data: { reason: 'Remote Dashboard Emergency Trigger' } }
    });
    alert("Emergency Command Sent to Kernel via LyncBus");
  };

  if (!metrics) return <div className="p-8 text-center">Loading SACCO metrics...</div>;

  const chartData = [
    { name: 'Mon', revenue: 45000 },
    { name: 'Tue', revenue: 52000 },
    { name: 'Wed', revenue: 48000 },
    { name: 'Thu', revenue: 61000 },
    { name: 'Fri', revenue: 55000 },
    { name: 'Sat', revenue: 67000 },
    { name: 'Sun', revenue: 58000 },
  ];

  const branchData = [
    { name: 'Nairobi', value: 45 },
    { name: 'Mombasa', value: 25 },
    { name: 'Nakuru', value: 20 },
    { name: 'Kisumu', value: 10 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-500 mt-1 font-medium">Real-time SACCO performance overview</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
            <Calendar size={18} className="text-slate-400" />
            <span className="font-semibold text-slate-700">{new Date().toLocaleDateString('en-KE', { dateStyle: 'long' })}</span>
          </div>
          <button 
            onClick={triggerEmergency}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold hover:bg-red-100 transition-all"
          >
            <AlertOctagon size={18} /> Emergency Pulse
          </button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Trips Today" 
          value={metrics.totalTripsToday} 
          icon={Activity} 
          color="bg-blue-600" 
          trend="+12%" 
          isPositive 
        />
        <StatCard 
          label="Est. Revenue (KES)" 
          value={metrics.revenueSummary.toLocaleString()} 
          icon={DollarSign} 
          color="bg-emerald-600" 
          trend="+5.4%" 
          isPositive 
        />
        <StatCard 
          label="Avg Trust Score" 
          value={`${metrics.avgTrustScore}%`} 
          icon={ShieldCheck} 
          color="bg-amber-500" 
          trend="-2.1%" 
          isPositive={false} 
        />
        <StatCard 
          label="Upcoming Handovers" 
          value={metrics.upcomingHandovers} 
          icon={Repeat} 
          color="bg-indigo-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-800">Weekly Revenue Trend</h2>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Real-time Feed</span>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                  cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LyncBus Kernel Telemetry Monitor */}
        <div className="bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-800 text-slate-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Terminal size={20} className="text-blue-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">Kernel Telemetry</h2>
            </div>
            <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${kernelTelemetry ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
              {kernelTelemetry ? 'CONNECTED' : 'WAITING'}
            </div>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <p className="text-slate-500 mb-1">// Last Pulse Received</p>
              <p className="text-blue-400 font-bold">{lastKernelPulse}</p>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 min-h-[160px]">
              <p className="text-slate-500 mb-2">// Active Bus Payload</p>
              {kernelTelemetry ? (
                <pre className="text-emerald-400 overflow-hidden whitespace-pre-wrap">
                  {JSON.stringify(kernelTelemetry, null, 2)}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-24 text-slate-600 gap-2">
                  <Zap size={24} className="animate-pulse" />
                  <p>Awaiting Uplink...</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              <Activity size={12} /> Live Link Integrity
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
