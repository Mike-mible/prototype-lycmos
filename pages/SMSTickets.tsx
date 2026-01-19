
import React, { useEffect, useState } from 'react';
import { mosApi, mosWs } from '../services/api';
import { SMSTicket } from '../types';
import { MessageSquare, CheckCircle2, XCircle, Clock, Search } from 'lucide-react';

const SMSTickets: React.FC = () => {
  const [tickets, setTickets] = useState<SMSTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTicketId, setNewTicketId] = useState<string | null>(null);

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
    await mosApi.confirmTicket(id);
    fetchTickets();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">SMS Booking Feed</h1>
          <p className="text-slate-500 font-medium">Real-time ticket requests from mobile passengers</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search phone number or trip ID..." 
              className="pl-10 pr-4 py-2 w-full rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg border border-emerald-100 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              Live Feed
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Passenger Phone</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Trip & Segment</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Time</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">Loading tickets...</td></tr>
              ) : tickets.map(t => (
                <tr key={t.id} className={`transition-all duration-700 ${newTicketId === t.id ? 'bg-blue-50 animate-pulse border-y border-blue-200' : 'hover:bg-slate-50'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} className="text-slate-400" />
                      <span className="font-bold text-slate-900">{t.passengerPhone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-700">{t.tripId}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{t.segmentId}</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">KES {t.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                      t.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-slate-500 text-xs">
                      <Clock size={12} />
                      {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {t.status === 'PENDING' ? (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleConfirm(t.id)}
                          className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                          title="Confirm Booking"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                        <button className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors" title="Cancel Request">
                          <XCircle size={18} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-emerald-500 font-bold text-xs">Processed</span>
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
