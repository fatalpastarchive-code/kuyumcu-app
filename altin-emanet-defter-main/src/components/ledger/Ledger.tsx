import React, { useState } from "react";
import { useQuery } from "convex/react";
// @ts-ignore
import { api } from "@convex/_generated/api.js";
import { useAuth } from "@clerk/clerk-react";
import { Search, Users, ChevronRight, Phone, MessageSquare, ArrowUpRight, ArrowDownLeft, BookOpen } from "lucide-react";
import { toast } from "sonner";

const METAL_TYPES = [
  { code: "TL", label: "Türk Lirası (₺)", icon: "₺" },
  { code: "gram_24k", label: "24 Ayar Has Altın (gr)", icon: "Au" },
  { code: "gram_22k", label: "22 Ayar Altın (gr)", icon: "Au" },
  { code: "quarter", label: "Çeyrek Altın (Adet)", icon: "Q" },
  { code: "USD", label: "Amerikan Doları ($)", icon: "$" },
  { code: "EUR", label: "Euro (€)", icon: "€" },
];

export function Ledger() {
  const { userId } = useAuth();
  const customers = useQuery(api.customers.getShopCustomers, userId ? { clerkId: userId } : "skip");
  const transactions = useQuery(api.transactions.getShopTransactions, userId ? { clerkId: userId } : "skip");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const selectedCustomer = customers?.find((c: any) => c._id === selectedCustomerId);
  const selectedCustomerTx = transactions?.filter((t: any) => t.customerId === selectedCustomerId);

  const getCustomerBalances = (customerId: string) => {
    const customerTx = transactions?.filter((t: any) => t.customerId === customerId) || [];
    const balances: Record<string, number> = {};

    customerTx.forEach((tx: any) => {
      const type = tx.type;
      const metal = tx.metalType;
      const amount = tx.amount;

      if (!balances[metal]) balances[metal] = 0;

      if (type === "debt") {
        balances[metal] += amount;
      } else {
        balances[metal] -= amount;
      }
    });

    return balances;
  };

  const filteredCustomers = customers?.filter((c: any) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  ) || [];

  const formatBalance = (metal: string, amount: number) => {
    if (Math.abs(amount) < 0.001) return null;
    const sign = amount > 0 ? "+" : "";
    let unit = "";
    if (metal === "TL") unit = " ₺";
    else if (metal.startsWith("gram")) unit = " gr";
    else if (metal === "quarter") unit = " Çeyrek";
    else if (metal === "USD") unit = " $";
    else if (metal === "EUR") unit = " €";

    return (
      <div key={metal} className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
        amount > 0 
          ? "bg-red-500/10 text-red-400 border-red-500/20" 
          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      }`}>
        {sign}{amount.toLocaleString("tr-TR", { maximumFractionDigits: 2 })}{unit}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-amber-500 selection:text-black pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-900/60 py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <BookOpen className="w-5 h-5 text-zinc-950" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">Defter</h1>
            <p className="text-[10px] text-amber-500 font-semibold tracking-widest uppercase -mt-1">
              Müşteri ve İşlem Geçmişi
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Müşteri ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 bg-zinc-900/60 border border-zinc-900 rounded-xl focus:outline-none focus:border-amber-500/40 text-sm placeholder-zinc-500"
          />
        </div>

        {/* Customers List */}
        <div className="space-y-2">
          <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider px-1">
            Müşteriler ({filteredCustomers.length})
          </span>
          <div className="bg-zinc-900/40 border border-zinc-900/60 rounded-3xl overflow-hidden divide-y divide-zinc-900/60">
            {filteredCustomers.length === 0 ? (
              <div className="p-12 text-center text-zinc-500">
                <Users className="w-8 h-8 mx-auto mb-3 opacity-40 text-amber-500" />
                <p className="text-sm font-medium">Müşteri bulunamadı</p>
              </div>
            ) : (
              filteredCustomers.map((customer: any) => {
                const balances = getCustomerBalances(customer._id);
                const hasBalance = Object.values(balances).some(v => Math.abs(v) > 0.001);
                
                return (
                  <div
                    key={customer._id}
                    onClick={() => setSelectedCustomerId(customer._id)}
                    className="p-4 hover:bg-zinc-900/30 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {customer.profileImage ? (
                        <img
                          src={customer.profileImage}
                          alt={customer.name}
                          className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-900 border border-zinc-800 object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 font-bold text-sm flex-shrink-0">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="font-bold text-sm text-zinc-100 block group-hover:text-amber-500 transition-colors">
                          {customer.name}
                        </span>
                        <span className="text-zinc-500 text-xs block">{customer.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                        {hasBalance ? (
                          Object.entries(balances).map(([metal, amt]) => formatBalance(metal, amt))
                        ) : (
                          <span className="text-xs text-zinc-600 italic">Temiz</span>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-500 transition-colors" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Customer Detail Modal */}
      {selectedCustomerId && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedCustomerId(null)}
          />
          <div className="relative w-full max-w-lg bg-zinc-900/95 border-t border-zinc-800 rounded-t-[32px] shadow-2xl p-4 overflow-hidden max-h-[85vh] flex flex-col z-10">
            <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto mb-4 flex-shrink-0" />

            {/* Customer Details Header */}
            <div className="flex items-start justify-between mb-4 flex-shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                {selectedCustomer.profileImage ? (
                  <img
                    src={selectedCustomer.profileImage}
                    alt={selectedCustomer.name}
                    className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-extrabold text-sm flex-shrink-0">
                    {selectedCustomer.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-bold text-base text-white leading-tight truncate">{selectedCustomer.name}</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5 truncate">{selectedCustomer.phone}</p>
                </div>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <a
                  href={`tel:${selectedCustomer.phone}`}
                  className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
                <a
                  href={`sms:${selectedCustomer.phone}?body=Sayın ${selectedCustomer.name}, Altın Defter borç hatırlatması.`}
                  className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Quick Balance display */}
            <div className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-3 mb-4 flex-shrink-0">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Güncel Borç Durumu</span>
              <div className="flex flex-wrap gap-1.5">
                {(() => {
                  const balances = getCustomerBalances(selectedCustomer._id);
                  const hasBalance = Object.values(balances).some(v => Math.abs(v) > 0.001);
                  return hasBalance ? (
                    Object.entries(balances).map(([metal, amt]) => formatBalance(metal, amt))
                  ) : (
                    <span className="text-xs text-zinc-500 italic">Borç veya alacak yok</span>
                  );
                })()}
              </div>
            </div>

            {/* Transaction history */}
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">İşlem Geçmişi</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-0 pb-20">
              {selectedCustomerTx && selectedCustomerTx.length === 0 ? (
                <div className="py-8 text-center text-zinc-600">
                  <p className="text-[10px]">İşlem kaydı yok</p>
                </div>
              ) : (
                selectedCustomerTx?.map((tx: any) => (
                  <div key={tx._id} className="bg-zinc-950/40 border border-zinc-900 rounded-lg p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                        tx.type === "debt"
                          ? "bg-red-500/10 text-red-500"
                          : "bg-emerald-500/10 text-emerald-500"
                      }`}>
                        {tx.type === "debt" ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-zinc-200 block truncate">
                          {tx.note || (tx.type === "debt" ? "Borç Kaydı" : "Ödeme")}
                        </span>
                        <span className="text-[9px] text-zinc-500 block truncate">
                          {new Date(tx.createdAt).toLocaleDateString("tr-TR")}
                          {tx.dueDate && ` · Vade: ${new Date(tx.dueDate).toLocaleDateString("tr-TR")}`}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-xs font-bold block ${
                        tx.type === "debt" ? "text-red-400" : "text-emerald-400"
                      }`}>
                        {tx.type === "debt" ? "" : "-"}{tx.amount} <span className="text-[9px] uppercase">{tx.metalType}</span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
