import React from "react";
import { useQuery } from "convex/react";
// @ts-ignore
import { api } from "@convex/_generated/api.js";
import { useAuth } from "@clerk/clerk-react";
import { Bell, AlertCircle, Clock, Calendar, Phone, MessageSquare, ChevronRight } from "lucide-react";

export function Deadlines() {
  const { userId } = useAuth();
  const customers = useQuery(api.customers.getShopCustomers, userId ? { clerkId: userId } : "skip");
  const transactions = useQuery(api.transactions.getShopTransactions, userId ? { clerkId: userId } : "skip");

  const getDeadlines = () => {
    const now = Date.now();
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const todayEnd = new Date().setHours(23, 59, 59, 999);
    
    const overdue: any[] = [];
    const dueToday: any[] = [];
    const upcoming: any[] = [];

    transactions?.forEach((tx: any) => {
      if (tx.type === "debt" && tx.dueDate && !tx.isCompleted) {
        const customer = customers?.find((c: any) => c._id === tx.customerId);
        
        if (tx.dueDate < todayStart) {
          overdue.push({ ...tx, customer });
        } else if (tx.dueDate >= todayStart && tx.dueDate <= todayEnd) {
          dueToday.push({ ...tx, customer });
        } else if (tx.dueDate > todayEnd) {
          upcoming.push({ ...tx, customer });
        }
      }
    });

    // Sort by due date
    overdue.sort((a, b) => a.dueDate - b.dueDate);
    dueToday.sort((a, b) => a.dueDate - b.dueDate);
    upcoming.sort((a, b) => a.dueDate - b.dueDate);

    return { overdue, dueToday, upcoming };
  };

  const { overdue, dueToday, upcoming } = getDeadlines();
  const totalOverdue = overdue.length;

  const formatMetal = (metalType: string) => {
    if (metalType === "TL") return "₺";
    if (metalType.startsWith("gram")) return "gr";
    if (metalType === "quarter") return "Çeyrek";
    if (metalType === "USD") return "$";
    if (metalType === "EUR") return "€";
    return metalType;
  };

  const formatDaysOverdue = (dueDate: number) => {
    const now = Date.now();
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const daysOverdue = Math.floor((todayStart - dueDate) / (1000 * 60 * 60 * 24));
    return daysOverdue;
  };

  const formatDaysUntil = (dueDate: number) => {
    const now = Date.now();
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const daysUntil = Math.floor((dueDate - todayStart) / (1000 * 60 * 60 * 24));
    return daysUntil;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-amber-500 selection:text-black pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-900/60 py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Bell className="w-5 h-5 text-zinc-950" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">Vadeler</h1>
            <p className="text-[10px] text-amber-500 font-semibold tracking-widest uppercase -mt-1">
              Ödemeler ve Son Tarihler
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className={`border rounded-2xl p-2.5 flex flex-col justify-between shadow-sm min-w-0 ${
            totalOverdue > 0
              ? "bg-red-500/5 border-red-500/20"
              : "bg-zinc-900/60 border-zinc-900"
          }`}>
            <span className="text-[8px] font-bold uppercase tracking-wider block">Geciken</span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-sm sm:text-base font-extrabold text-red-400">{totalOverdue}</span>
              <AlertCircle className={`w-3 h-3 ${totalOverdue > 0 ? "text-red-400 animate-pulse" : "text-zinc-600"}`} />
            </div>
          </div>
          
          <div className="bg-zinc-900/60 border border-zinc-900 rounded-2xl p-2.5 flex flex-col justify-between shadow-sm min-w-0">
            <span className="text-[8px] font-bold uppercase tracking-wider block text-zinc-500">Bugün</span>
            <span className="text-sm sm:text-base font-extrabold text-amber-400 mt-0.5">{dueToday.length}</span>
          </div>
          
          <div className="bg-zinc-900/60 border border-zinc-900 rounded-2xl p-2.5 flex flex-col justify-between shadow-sm min-w-0">
            <span className="text-[8px] font-bold uppercase tracking-wider block text-zinc-500">Yaklaşan</span>
            <span className="text-sm sm:text-base font-extrabold text-zinc-300 mt-0.5">{upcoming.length}</span>
          </div>
        </div>

        {/* Overdue Section */}
        {overdue.length > 0 && (
          <div className="space-y-2">
            <span className="text-red-400 text-xs font-bold uppercase tracking-wider px-1 flex items-center gap-2">
              <AlertCircle className="w-3 h-3" />
              Geciken Ödemeler ({overdue.length})
            </span>
            <div className="bg-red-500/5 border border-red-500/20 rounded-3xl overflow-hidden divide-y divide-red-500/10">
              {overdue.map((item) => (
                <div key={item._id} className="p-4 hover:bg-red-500/10 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {item.customer?.profileImage ? (
                        <img
                          src={item.customer.profileImage}
                          alt={item.customer.name}
                          className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-400 font-bold text-xs flex-shrink-0">
                          {item.customer?.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="font-bold text-sm text-zinc-100 block truncate">
                          {item.customer?.name}
                        </span>
                        <span className="text-xs text-red-400 font-semibold">
                          {formatDaysOverdue(item.dueDate)} gün gecikmiş
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-bold text-red-400 block">
                        {item.amount} {formatMetal(item.metalType)}
                      </span>
                      <span className="text-[9px] text-zinc-500">
                        {new Date(item.dueDate).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                  </div>
                  {item.note && (
                    <p className="text-[10px] text-zinc-500 mt-1 truncate">{item.note}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <a
                      href={`tel:${item.customer?.phone}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      Ara
                    </a>
                    <a
                      href={`sms:${item.customer?.phone}?body=Sayın ${item.customer?.name}, ${item.amount} ${formatMetal(item.metalType)} borcunuz ${formatDaysOverdue(item.dueDate)} gün gecikmiştir. Lütfen ödeme yapınız.`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
                    >
                      <MessageSquare className="w-3 h-3" />
                      SMS
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Due Today Section */}
        {dueToday.length > 0 && (
          <div className="space-y-2">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider px-1 flex items-center gap-2">
              <Clock className="w-3 h-3" />
              Bugün Vade ({dueToday.length})
            </span>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl overflow-hidden divide-y divide-amber-500/10">
              {dueToday.map((item) => (
                <div key={item._id} className="p-4 hover:bg-amber-500/10 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      {item.customer?.profileImage ? (
                        <img
                          src={item.customer.profileImage}
                          alt={item.customer.name}
                          className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-400 font-bold text-xs flex-shrink-0">
                          {item.customer?.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="font-bold text-sm text-zinc-100 block truncate">
                          {item.customer?.name}
                        </span>
                        <span className="text-xs text-amber-400 font-semibold">Bugün son gün</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-bold text-amber-400 block">
                        {item.amount} {formatMetal(item.metalType)}
                      </span>
                    </div>
                  </div>
                  {item.note && (
                    <p className="text-[10px] text-zinc-500 mt-1 truncate">{item.note}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Section */}
        {upcoming.length > 0 && (
          <div className="space-y-2">
            <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider px-1 flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              Yaklaşan Vadeler ({upcoming.length})
            </span>
            <div className="bg-zinc-900/40 border border-zinc-900/60 rounded-3xl overflow-hidden divide-y divide-zinc-900/60">
              {upcoming.slice(0, 10).map((item) => (
                <div key={item._id} className="p-4 hover:bg-zinc-900/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      {item.customer?.profileImage ? (
                        <img
                          src={item.customer.profileImage}
                          alt={item.customer.name}
                          className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-400 font-bold text-xs flex-shrink-0">
                          {item.customer?.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="font-bold text-sm text-zinc-100 block truncate">
                          {item.customer?.name}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {formatDaysUntil(item.dueDate)} gün kaldı
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-bold text-zinc-300 block">
                        {item.amount} {formatMetal(item.metalType)}
                      </span>
                      <span className="text-[9px] text-zinc-500">
                        {new Date(item.dueDate).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                  </div>
                  {item.note && (
                    <p className="text-[10px] text-zinc-500 mt-1 truncate">{item.note}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {overdue.length === 0 && dueToday.length === 0 && upcoming.length === 0 && (
          <div className="bg-zinc-900/40 border border-zinc-900/60 rounded-3xl p-12 text-center">
            <Bell className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
            <p className="text-sm font-medium text-zinc-400">Vade bekleyen ödeme yok</p>
            <p className="text-xs text-zinc-600 mt-1">Tüm ödemeler zamanında</p>
          </div>
        )}
      </main>
    </div>
  );
}
