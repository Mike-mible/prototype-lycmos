
import React, { useEffect, useState } from 'react';
import { mosApi, mosWs } from '../services/api';
import { SMSTicket } from '../types';
import { MessageSquare, CheckCircle2, XCircle, Clock, Search, ShieldX } from 'lucide-react';

const SMSTickets: React.FC = () => {
  const [tickets, setTickets] = useState<SMSTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTicketId, setNewTicketId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchTickets = async () => {
    const data = await mosApi.getSMSTickets();
    setTickets(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();

    const unsub = mosWs.on('NEW_SMS_TICKET', async (data) => {
      setNewTicketId(data.id);
      await fetchTickets();
      setTimeout(() => setNewTicketId(null), 3000);
    });

    return () => unsub();
  }, []);

  const handleConfirm = async (id: string) => {
    setProcessingId(id);
    await mosApi.confirmTicket(id);
    await fetchTickets();
    setProcessingId(null);
  };

  const handleCancel = async (id: string) => {
    if(!confirm("Are you sure you want to cancel this booking request?")) return;
    setProcessingId(id);
    await mosApi.cancelTicket(id);
    await fetchTickets();
    setProcessingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">SMS Booking Feed</h1>
          <p className="text-slate-500 font-medium">Real-time ticket requests from mobile passengers</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search phone number or trip ID..." 
              className="pl-10 pr-4 py-2.5 w-full rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-black uppercase tracking-widest rounded-full border border-emerald-100 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              Live Link
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Passenger Phone</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Trip Journey</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Time</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-20 text-slate-400 font-medium">Awaiting uplink...</td></tr>
              ) : tickets.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-20 text-slate-400 font-medium">No booking requests found.</td></tr>
              ) : tickets.map(t => (
                <tr key={t.id} className={`transition-all duration-700 ${newTicketId === t.id ? 'bg-blue-50 animate-pulse border-y border-blue-200' : 'hover:bg-slate-50/50'}`}>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg"><MessageSquare size={16} className="text-slate-500" /></div>
                      <span className="font-bold text-slate-900 tracking-tight">{t.passengerPhone}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{t.tripId}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{t.segmentId}</p>
                  </td>
                  <td className="px-8 py-5 font-black text-slate-900">KES {t.amount}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      t.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                      t.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-100' :
                      'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                      <Clock size={12} />
                      {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    {t.status === 'PENDING' ? (
                      <div className="flex justify-end gap-2">
                        <button 
                          disabled={processingId === t.id}
                          onClick={() => handleConfirm(t.id)}
                          className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all active:scale-95 disabled:opacity-50 border border-emerald-100"
                          title="Confirm Booking"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                        <button 
                          disabled={processingId === t.id}
                          onClick={() => handleCancel(t.id)}
                          className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all active:scale-95 disabled:opacity-50 border border-red-100" 
                          title="Cancel Request"
                        >
                          < ShieldX size={18} />
                        </button>
                      </div>
                    ) : (
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${t.status === 'CONFIRMED' ? 'text-emerald-500' : 'text-red-400'}`}>
                        {t.status === 'CONFIRMED' ? 'PROCESSED' : 'REJECTED'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SMSTickets;
