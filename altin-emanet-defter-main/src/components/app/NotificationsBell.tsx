import { useState } from "react";
import { useQuery } from "convex/react";
// @ts-ignore
import { api } from "@convex/_generated/api.js";
import { Bell, Calendar, CheckCircle2, Clock, X } from "lucide-react";

export function NotificationsBell({ userId = "demo-user" }: { userId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const dueTransactions = useQuery(api.transactions.getActiveDueTransactions, { clerkId: userId }) || [];
  const upcomingTransactions = useQuery(api.transactions.getUpcomingDueTransactions, { daysAhead: 7, clerkId: userId }) || [];

  const totalUnread = dueTransactions.length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-xl border border-zinc-800 bg-zinc-900/80 p-2 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
        aria-label="Bildirimler"
      >
        <Bell className="h-5 w-5 text-amber-400" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg animate-pulse">
            {totalUnread}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl z-50 text-white animate-fade-up">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-400" />
                <h3 className="font-bold text-sm">Vade Bildirimleri</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {dueTransactions.length === 0 && upcomingTransactions.length === 0 ? (
                <div className="py-6 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500/40" />
                  <span>Yaklaşan veya geciken borç bildirimi bulunmuyor.</span>
                </div>
              ) : (
                <>
                  {dueTransactions.length > 0 && (
                    <div className="mb-2">
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block mb-1.5">
                        Vadesi Dolmuş / Bugün (Gecikenler)
                      </span>
                      {dueTransactions.map((tx: any) => (
                        <div key={tx._id} className="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 mb-1.5 flex items-start justify-between">
                          <div>
                            <div className="font-bold text-xs text-zinc-100">{tx.customerName}</div>
                            <div className="text-[11px] text-red-300 font-semibold mt-0.5">
                              {tx.amount} {tx.metalType}
                            </div>
                            <div className="text-[9px] text-zinc-400 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3 text-red-400" />
                              Vade: {new Date(tx.dueDate).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {upcomingTransactions.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1.5">
                        Yaklaşan Vadeler (Gelecek 7 Gün)
                      </span>
                      {upcomingTransactions.map((tx: any) => (
                        <div key={tx._id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-2.5 mb-1.5 flex items-start justify-between">
                          <div>
                            <div className="font-bold text-xs text-zinc-200">{tx.customerName}</div>
                            <div className="text-[11px] text-amber-400 font-semibold mt-0.5">
                              {tx.amount} {tx.metalType}
                            </div>
                            <div className="text-[9px] text-zinc-400 flex items-center gap-1 mt-1">
                              <Calendar className="w-3 h-3 text-amber-400" />
                              Vade: {new Date(tx.dueDate).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
