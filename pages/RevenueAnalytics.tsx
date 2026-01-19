
import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend
} from 'recharts';
import { TrendingUp, ShieldCheck, DollarSign, ArrowUpRight, RefreshCw } from 'lucide-react';
import { mosWs } from '../services/api';

const RevenueAnalytics: React.FC = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [revenueData, setRevenueData] = useState([
    { name: 'Jan', nairobi: 1.2, mombasa: 0.8, nakuru: 0.5 },
    { name: 'Feb', nairobi: 1.4, mombasa: 0.9, nakuru: 0.6 },
    { name: 'Mar', nairobi: 1.1, mombasa: 1.1, nakuru: 0.7 },
    { name: 'Apr', nairobi: 1.6, mombasa: 1.2, nakuru: 0.5 },
    { name: 'May', nairobi: 1.8, mombasa: 1.4, nakuru: 0.8 },
    { name: 'Jun', nairobi: 2.1, mombasa: 1.5, nakuru: 1.0 },
  ]);

  useEffect(() => {
    // Listen for Real-Time State updates from the Core via WebSocket
    const unsub = mosWs.on('REVENUE_DECLARED', (data) => {
      setIsUpdating(true);
      
      // Simulate data adjustment based on real-time event
      setRevenueData(prev => {
        const newData = [...prev];
        const lastIndex = newData.length - 1;
        // Adjust Nairobi branch for demo if it's Nairobi event
        if (data.branchId === 'B-NRB') {
          newData[lastIndex] = { 
            ...newData[lastIndex], 
            nairobi: newData[lastIndex].nairobi + 0.05 
          };
        }
        return newData;
      });

      setTimeout(() => setIsUpdating(false), 2000);
    });

    return () => unsub();
  }, []);

  const trustTrend = [
    { day: '1', score: 85 }, { day: '5', score: 88 }, { day: '10', score: 82 },
    { day: '15', score: 91 }, { day: '20', score: 89 }, { day: '25', score: 94 },
    { day: '30', score: 96 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Financial & Trust Analytics</h1>
            {isUpdating && <RefreshCw size={20} className="text-blue-500 animate-spin" />}
          </div>
          <p className="text-slate-500 font-medium">Deep dive into SACCO profitability and reliability</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-700">Export PDF</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30">Generate Report</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 transition-all duration-500 overflow-hidden relative">
          {isUpdating && <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-pulse" />}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <DollarSign size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Branch Revenue (M KES)</h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth</p>
              <p className="text-lg font-bold text-emerald-600 flex items-center justify-end">
                +14.2% <ArrowUpRight size={16} />
              </p>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="nairobi" name="Nairobi" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="mombasa" name="Mombasa" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="nakuru" name="Nakuru" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <ShieldCheck size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Trust Score Trend (%)</h2>
            </div>
            <div className="text-right text-sm font-bold text-blue-600">30 Day Cycle</div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trustTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Revenue per Vehicle', value: 'KES 14,200', change: '+5%', icon: TrendingUp, color: 'text-blue-600' },
          { label: 'Settlement Speed', value: '45 mins', change: '-12%', icon: ShieldCheck, color: 'text-emerald-600' },
          { label: 'Crew Retention', value: '94%', change: '+2%', icon: ShieldCheck, color: 'text-indigo-600' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
              <h4 className="text-2xl font-bold text-slate-900">{kpi.value}</h4>
              <p className="text-xs font-bold text-emerald-600 mt-1">{kpi.change} from last month</p>
            </div>
            <div className={`p-4 rounded-xl bg-slate-50 ${kpi.color}`}>
              <kpi.icon size={24} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenueAnalytics;
