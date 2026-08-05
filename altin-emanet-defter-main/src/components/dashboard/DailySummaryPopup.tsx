import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
// @ts-ignore
import { api } from "@convex/_generated/api.js";
import {
  X,
  AlertTriangle,
  Clock,
  CalendarCheck,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

const METAL_LABELS: Record<string, string> = {
  TL: "₺",
  gram_24k: "gr (24K)",
  gram_22k: "gr (22K)",
  quarter: "Çeyrek",
  USD: "$",
  EUR: "€",
};

interface DailySummaryPopupProps {
  clerkId?: string;
}

export function DailySummaryPopup({ clerkId = "demo-user" }: DailySummaryPopupProps) {
  const [visible, setVisible] = useState(false);

  // Fetch today's + overdue and upcoming (next 3 days)
  const dueTx = useQuery(api.transactions.getActiveDueTransactions, { clerkId });
  const upcomingTx = useQuery(api.transactions.getUpcomingDueTransactions, {
    daysAhead: 3,
    clerkId,
  });

  useEffect(() => {
    // Show popup once per day
    const todayKey = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
    const lastShown = localStorage.getItem("dailySummaryShown");

    if (lastShown !== todayKey) {
      // Wait for data to load, then decide whether to show
      if (dueTx !== undefined && upcomingTx !== undefined) {
        const hasSomething = (dueTx && dueTx.length > 0) || (upcomingTx && upcomingTx.length > 0);
        if (hasSomething) {
          setVisible(true);
        }
      }
    }
  }, [dueTx, upcomingTx]);

  const dismiss = () => {
    const todayKey = new Date().toISOString().split("T")[0];
    localStorage.setItem("dailySummaryShown", todayKey);
    setVisible(false);
  };

  // Group overdue transactions by metal type for summary
  const overdueGrouped = useMemo(() => {
    if (!dueTx) return {};
    const groups: Record<string, { total: number; count: number }> = {};
    dueTx.forEach((tx: any) => {
      const metal = tx.metalType;
      if (!groups[metal]) groups[metal] = { total: 0, count: 0 };
      groups[metal].total += tx.amount;
      groups[metal].count += 1;
    });
    return groups;
  }, [dueTx]);

  if (!visible) return null;

  const overdueCount = dueTx?.length || 0;
  const upcomingCount = upcomingTx?.length || 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl animate-fade-up overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-amber-500/15 via-amber-600/10 to-transparent border-b border-zinc-800 p-5">
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
              <CalendarCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-zinc-100">Günün Özeti</h2>
              <p className="text-xs text-zinc-400">
                {new Date().toLocaleDateString("tr-TR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex gap-3 mt-4">
            {overdueCount > 0 && (
              <div className="flex-1 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 text-center">
                <p className="text-xl font-black text-red-400">{overdueCount}</p>
                <p className="text-[10px] text-red-400/80 font-semibold uppercase tracking-wider">
                  Vadesi Geçen
                </p>
              </div>
            )}
            {upcomingCount > 0 && (
              <div className="flex-1 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2.5 text-center">
                <p className="text-xl font-black text-amber-400">{upcomingCount}</p>
                <p className="text-[10px] text-amber-400/80 font-semibold uppercase tracking-wider">
                  Yaklaşan (3 Gün)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-4 max-h-[50vh] overflow-y-auto space-y-3 scrollbar-thin">
          {/* Overdue summary by metal */}
          {overdueCount > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                  Vadesi Geçen Borçlar
                </span>
              </div>
              <div className="bg-zinc-800/60 rounded-xl border border-zinc-800 divide-y divide-zinc-800">
                {Object.entries(overdueGrouped).map(([metal, data]) => (
                  <div key={metal} className="flex items-center justify-between px-3.5 py-2.5">
                    <span className="text-xs text-zinc-400 font-medium">
                      {data.count} borç
                    </span>
                    <span className="text-sm font-bold text-red-400">
                      {data.total.toLocaleString("tr-TR", { maximumFractionDigits: 2 })}{" "}
                      {METAL_LABELS[metal] || metal}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overdue transaction list */}
          {overdueCount > 0 && dueTx && (
            <div className="space-y-1.5">
              {dueTx.slice(0, 5).map((tx: any) => (
                <div
                  key={tx._id}
                  className="flex items-center justify-between bg-zinc-800/40 rounded-lg px-3 py-2 border border-zinc-800/60"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-red-500/15 border border-red-500/25 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-red-400">
                        {(tx.customerName || "?")[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-200 truncate">
                        {tx.customerName}
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        {new Date(tx.dueDate).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-red-400 flex-shrink-0 ml-2">
                    {tx.amount.toLocaleString("tr-TR", { maximumFractionDigits: 2 })}{" "}
                    {METAL_LABELS[tx.metalType] || tx.metalType}
                  </span>
                </div>
              ))}
              {overdueCount > 5 && (
                <p className="text-[10px] text-zinc-500 text-center pt-1">
                  +{overdueCount - 5} borç daha...
                </p>
              )}
            </div>
          )}

          {/* Upcoming transactions */}
          {upcomingCount > 0 && upcomingTx && (
            <div>
              <div className="flex items-center gap-2 mb-2 mt-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Yaklaşan Vadeler
                </span>
              </div>
              <div className="space-y-1.5">
                {upcomingTx.slice(0, 5).map((tx: any) => {
                  const daysLeft = Math.ceil(
                    (tx.dueDate - Date.now()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div
                      key={tx._id}
                      className="flex items-center justify-between bg-zinc-800/40 rounded-lg px-3 py-2 border border-zinc-800/60"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-amber-400">
                            {(tx.customerName || "?")[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-zinc-200 truncate">
                            {tx.customerName}
                          </p>
                          <p className="text-[10px] text-zinc-500">
                            {daysLeft <= 0
                              ? "Bugün"
                              : daysLeft === 1
                                ? "Yarın"
                                : `${daysLeft} gün sonra`}
                            {" · "}
                            {new Date(tx.dueDate).toLocaleDateString("tr-TR", {
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-400 flex-shrink-0 ml-2">
                        {tx.amount.toLocaleString("tr-TR", { maximumFractionDigits: 2 })}{" "}
                        {METAL_LABELS[tx.metalType] || tx.metalType}
                      </span>
                    </div>
                  );
                })}
                {upcomingCount > 5 && (
                  <p className="text-[10px] text-zinc-500 text-center pt-1">
                    +{upcomingCount - 5} vade daha...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* No data state */}
          {overdueCount === 0 && upcomingCount === 0 && (
            <div className="text-center py-6">
              <TrendingUp className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-zinc-200">Bugün her şey yolunda!</p>
              <p className="text-xs text-zinc-500 mt-1">Vadesi geçen veya yaklaşan borç yok.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 pt-2 border-t border-zinc-800">
          <button
            onClick={dismiss}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-zinc-950 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            Tamam, Anladım
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
