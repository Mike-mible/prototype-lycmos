
import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend
} from 'recharts';
import { TrendingUp, ShieldCheck, DollarSign, ArrowUpRight, RefreshCw, FileText, Download } from 'lucide-react';
import { mosWs } from '../services/api';

const RevenueAnalytics: React.FC = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [revenueData, setRevenueData] = useState([
    { name: 'Jan', nairobi: 1.2, mombasa: 0.8, nakuru: 0.5 },
    { name: 'Feb', nairobi: 1.4, mombasa: 0.9, nakuru: 0.6 },
    { name: 'Mar', nairobi: 1.1, mombasa: 1.1, nakuru: 0.7 },
    { name: 'Apr', nairobi: 1.6, mombasa: 1.2, nakuru: 0.5 },
    { name: 'May', nairobi: 1.8, mombasa: 1.4, nakuru: 0.8 },
    { name: 'Jun', nairobi: 2.1, mombasa: 1.5, nakuru: 1.0 },
  ]);

  useEffect(() => {
    const unsub = mosWs.on('REVENUE_DECLARED', (data) => {
      setIsUpdating(true);
      setRevenueData(prev => {
        const newData = [...prev];
        const lastIndex = newData.length - 1;
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

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert("Executive Data Summary exported successfully as PDF.");
    }, 1500);
  };

  const handleGenerateReport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert("Operational Efficiency Report generated for Q2.");
    }, 2000);
  };

  const trustTrend = [
    { day: '1', score: 85 }, { day: '5', score: 88 }, { day: '10', score: 82 },
    { day: '15', score: 91 }, { day: '20', score: 89 }, { day: '25', score: 94 },
    { day: '30', score: 96 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Financial Engine</h1>
            {isUpdating && <RefreshCw size={24} className="text-blue-500 animate-spin" />}
          </div>
          <p className="text-slate-500 font-medium mt-1">Deep profitability analysis across all hub nodes</p>
        </div>
        <div className="flex gap-3">
          <button 
            disabled={isExporting}
            onClick={handleExport}
            className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 shadow-sm"
          >
            <Download size={14} /> Export Dataset
          </button>
          <button 
            disabled={isExporting}
            onClick={handleGenerateReport}
            className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <FileText size={14} /> {isExporting ? 'Synthesizing...' : 'Generate Q2 Report'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[40px] shadow-[0_30px_60px_rgba(0,0,0,0.03)] border border-slate-100/80 transition-all duration-500 overflow-hidden relative group">
          {isUpdating && <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-500 animate-pulse" />}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 shadow-sm">
                <DollarSign size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Branch Revenue</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Monthly aggregation (M KES)</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-emerald-600 flex items-center justify-end tracking-tighter">
                +14.2% <ArrowUpRight size={20} strokeWidth={3} />
              </p>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '16px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', textTransform: 'uppercase', fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em' }} />
                <Bar dataKey="nairobi" name="Nairobi Hub" fill="#0f172a" radius={[12, 12, 0, 0]} />
                <Bar dataKey="mombasa" name="Mombasa Hub" fill="#3b82f6" radius={[12, 12, 0, 0]} />
                <Bar dataKey="nakuru" name="Nakuru Hub" fill="#cbd5e1" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[40px] shadow-[0_30px_60px_rgba(0,0,0,0.03)] border border-slate-100/80 group">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 shadow-sm">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Trust Dynamics</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">30-day score variance (%)</p>
              </div>
            </div>
            <div className="text-right">
               <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">High Fidelity</span>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trustTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                   contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '16px' }}
                />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={6} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 10, strokeWidth: 0, shadow: '0 0 20px rgba(59,130,246,0.5)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Asset Yield', value: 'KES 14,200', change: '+5%', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50/50' },
          { label: 'Branch Integrity', value: '98.4%', change: '+1.2%', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
          { label: 'Settlement Speed', value: '45m', change: '-12%', icon: RefreshCw, color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100/80 flex items-center justify-between shadow-sm hover:shadow-xl transition-all duration-300 active:scale-[0.98]">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{kpi.label}</p>
              <h4 className="text-3xl font-black text-slate-900 tracking-tight">{kpi.value}</h4>
              <p className={`text-[10px] font-black mt-2 uppercase tracking-widest ${kpi.change.startsWith('+') ? 'text-emerald-500' : 'text-amber-500'}`}>{kpi.change} variance</p>
            </div>
            <div className={`p-5 rounded-[24px] ${kpi.bg} ${kpi.color} shadow-inner`}>
              <kpi.icon size={28} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenueAnalytics;
