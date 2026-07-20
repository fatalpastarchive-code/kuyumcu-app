import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
// @ts-ignore
import { api } from "@convex/_generated/api.js";
import {
  Plus, Search, Phone, MessageSquare, Calendar,
  TrendingUp, AlertCircle, ArrowUpRight, ArrowDownLeft,
  ChevronRight, Users, Settings, Trash2, X
} from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { BottomNavigation } from "../navigation/BottomNavigation";

// Altın ayarları ve birim etiketleri
const METAL_TYPES = [
  { code: "TL", label: "Türk Lirası (₺)", icon: "₺" },
  { code: "gram_24k", label: "24 Ayar Has Altın (gr)", icon: "Au" },
  { code: "gram_22k", label: "22 Ayar Altın (gr)", icon: "Au" },
  { code: "quarter", label: "Çeyrek Altın (Adet)", icon: "Q" },
  { code: "USD", label: "Amerikan Doları ($)", icon: "$" },
  { code: "EUR", label: "Euro (€)", icon: "€" },
];

export function Dashboard() {
  const { userId } = useAuth();
  const user = useQuery(api.users.getMe);
  const customers = useQuery(api.customers.getShopCustomers, userId ? { clerkId: userId } : "skip");
  const transactions = useQuery(api.transactions.getShopTransactions, userId ? { clerkId: userId } : "skip");
  
  const createCustomer = useMutation(api.customers.createCustomer);
  const createTransaction = useMutation(api.transactions.createTransaction);
  const updateCustomer = useMutation(api.customers.updateCustomer);
  const deleteCustomer = useMutation(api.customers.deleteCustomer);
  const deleteTransaction = useMutation(api.transactions.deleteTransaction);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");

  // Edit customer state
  const [showEditCustomer, setShowEditCustomer] = useState(false);
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editCustomerPhone, setEditCustomerPhone] = useState("");
  const [editCustomerImage, setEditCustomerImage] = useState("");
  
  // Detay sayfası durumları
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [txType, setTxType] = useState<"debt" | "payment">("debt");
  const [txMetalType, setTxMetalType] = useState("TL");
  const [txAmount, setTxAmount] = useState("");
  const [txNote, setTxNote] = useState("");
  const [txDueDate, setTxDueDate] = useState("");

  // Seçilen müşteri bilgileri
  const selectedCustomer = customers?.find((c: any) => c._id === selectedCustomerId);
  const selectedTransaction = transactions?.find((t: any) => t._id === selectedTransactionId);

  // Seçilen müşterinin hareketleri
  const selectedCustomerTx = transactions?.filter((t: any) => t.customerId === selectedCustomerId);

  // Müşterinin bakiye detaylarını hesapla (Birim bazında)
  const getCustomerBalances = (customerId: string) => {
    const customerTx = transactions?.filter((t: any) => t.customerId === customerId) || [];
    const balances: Record<string, number> = {};

    customerTx.forEach((tx: any) => {
      const type = tx.type; // "debt" veya "payment"
      const metal = tx.metalType;
      const amount = tx.amount;

      if (!balances[metal]) balances[metal] = 0;

      if (type === "debt") {
        balances[metal] += amount; // Borç eklendi
      } else {
        balances[metal] -= amount; // Ödeme yapıldı (borç düştü)
      }
    });

    return balances;
  };

  // Müşteri arama filtresi
  const filteredCustomers = customers?.filter((c: any) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  ) || [];

  // Toplam Borç İstatistikleri (Dükkan geneli)
  const getShopStats = () => {
    const totals: Record<string, number> = { TL: 0, gram_24k: 0, gram_22k: 0, quarter: 0 };
    let totalOverdue = 0;
    let totalDueToday = 0;
    const now = Date.now();
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const todayEnd = new Date().setHours(23, 59, 59, 999);

    transactions?.forEach((tx: any) => {
      const type = tx.type;
      const metal = tx.metalType;
      const amount = tx.amount;

      if (totals[metal] === undefined) totals[metal] = 0;

      if (type === "debt") {
        totals[metal] += amount;
        
        // Vade Kontrolleri
        if (tx.dueDate && !tx.isCompleted) {
          if (tx.dueDate < todayStart) {
            totalOverdue++;
          } else if (tx.dueDate >= todayStart && tx.dueDate <= todayEnd) {
            totalDueToday++;
          }
        }
      } else {
        totals[metal] -= amount;
      }
    });

    return { totals, totalOverdue, totalDueToday };
  };

  const stats = getShopStats();

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newCustomerPhone.trim()) {
      toast.error("Lütfen ad ve telefon bilgilerini eksiksiz doldurun.");
      return;
    }

    try {
      await createCustomer({
        name: newCustomerName.trim(),
        phone: newCustomerPhone.trim(),
        clerkId: userId!,
      });
      toast.success("Müşteri başarıyla eklendi.");
      setNewCustomerName("");
      setNewCustomerPhone("");
      setShowAddCustomer(false);
    } catch (err: any) {
      toast.error("Hata: " + err.message);
    }
  };

  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCustomerName.trim() || !editCustomerPhone.trim()) {
      toast.error("Lütfen ad ve telefon bilgilerini eksiksiz doldurun.");
      return;
    }

    try {
      await updateCustomer({
        customerId: selectedCustomerId as any,
        name: editCustomerName.trim(),
        phone: editCustomerPhone.trim(),
        profileImage: editCustomerImage.trim() || undefined,
        clerkId: userId!,
      });
      toast.success("Müşteri bilgileri güncellendi.");
      setShowEditCustomer(false);
      setEditCustomerName("");
      setEditCustomerPhone("");
      setEditCustomerImage("");
    } catch (err: any) {
      toast.error("Hata: " + err.message);
    }
  };

  const openEditCustomer = () => {
    if (selectedCustomer) {
      setEditCustomerName(selectedCustomer.name);
      setEditCustomerPhone(selectedCustomer.phone);
      setEditCustomerImage(selectedCustomer.profileImage || "");
      setShowEditCustomer(true);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomerId) return;

    if (!confirm("Bu müşteriyi ve tüm işlemlerini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
      return;
    }

    try {
      await deleteCustomer({
        customerId: selectedCustomerId as any,
        clerkId: userId!,
      });
      toast.success("Müşteri başarıyla silindi.");
      setSelectedCustomerId(null);
    } catch (err: any) {
      toast.error("Hata: " + err.message);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm("Bu işlemi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
      return;
    }

    try {
      await deleteTransaction({
        transactionId: transactionId as any,
        clerkId: userId!,
      });
      toast.success("İşlem başarıyla silindi.");
    } catch (err: any) {
      toast.error("Hata: " + err.message);
    }
  };

  const handleAddTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !txAmount || parseFloat(txAmount) <= 0) {
      toast.error("Lütfen geçerli bir tutar girin.");
      return;
    }

    try {
      await createTransaction({
        customerId: selectedCustomerId as any,
        type: txType,
        metalType: txMetalType,
        amount: parseFloat(txAmount),
        note: txNote.trim() || undefined,
        dueDate: txDueDate ? new Date(txDueDate).getTime() : undefined,
        clerkId: userId!,
      });
      toast.success(txType === "debt" ? "Borç başarıyla eklendi." : "Ödeme başarıyla kaydedildi.");
      setTxAmount("");
      setTxNote("");
      setTxDueDate("");
      setShowAddTransaction(false);
    } catch (err: any) {
      toast.error("Hata: " + err.message);
    }
  };

  // Birim formatlama
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
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-900/60 py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <span className="font-extrabold text-zinc-950 text-sm">AD</span>
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight block">Altın Defter</span>
            <span className="text-[10px] text-amber-500 font-semibold tracking-widest uppercase block -mt-1">Emanet Paneli</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* iOS style horizontal scrolling Quick Stats */}
        <div className="grid grid-cols-3 gap-2 overflow-x-hidden w-full">
          {/* TL Balance card */}
          <div className="bg-zinc-900/60 backdrop-blur border border-zinc-900 rounded-2xl p-2.5 flex flex-col justify-between shadow-sm relative overflow-hidden min-w-0">
            <div className="absolute top-0 right-0 w-12 h-12 bg-amber-500/5 rounded-full blur-xl" />
            <span className="text-zinc-500 text-[8px] font-bold uppercase tracking-wider">TL Bakiye</span>
            <span className="text-sm sm:text-base font-bold text-white tracking-tight mt-0.5 truncate">
              {(stats.totals.TL / 1000).toFixed(1)}k <span className="text-[9px] text-amber-500">₺</span>
            </span>
          </div>
          {/* Gram Balance card */}
          <div className="bg-zinc-900/60 backdrop-blur border border-zinc-900 rounded-2xl p-2.5 flex flex-col justify-between shadow-sm relative overflow-hidden min-w-0">
            <div className="absolute top-0 right-0 w-12 h-12 bg-yellow-400/5 rounded-full blur-xl" />
            <span className="text-zinc-500 text-[8px] font-bold uppercase tracking-wider">Has Altın</span>
            <span className="text-sm sm:text-base font-bold text-white tracking-tight mt-0.5 truncate">
              {stats.totals.gram_24k.toFixed(1)} <span className="text-[9px] text-amber-400">gr</span>
            </span>
          </div>
          {/* Overdues Alert */}
          <div className={`border rounded-2xl p-2.5 flex flex-col justify-between shadow-sm transition-colors min-w-0 ${
            stats.totalOverdue > 0
              ? "bg-red-500/5 border-red-500/20 text-red-400"
              : "bg-zinc-900/60 border-zinc-900 text-zinc-400"
          }`}>
            <span className="text-[8px] font-bold uppercase tracking-wider block">Gecikenler</span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-sm sm:text-base font-extrabold">{stats.totalOverdue}</span>
              <AlertCircle className={`w-3 h-3 ${stats.totalOverdue > 0 ? "text-red-400 animate-pulse" : "text-zinc-600"}`} />
            </div>
          </div>
        </div>

        {/* Search & Add Client Bar */}
        <div className="flex gap-2 overflow-x-hidden w-full">
          <div className="flex-1 relative min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Müşteri ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-zinc-900/60 border border-zinc-900 rounded-xl focus:outline-none focus:border-amber-500/40 text-sm placeholder-zinc-500"
            />
          </div>
          <button
            onClick={() => setShowAddCustomer(true)}
            className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-zinc-950 font-bold px-3 rounded-xl flex items-center justify-center gap-1 transition-all text-sm shadow-lg shadow-amber-500/10 cursor-pointer flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Ekle</span>
          </button>
        </div>

        {/* iOS style Customers List View */}
        <div className="space-y-2">
          <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider px-1">Müşteriler</span>
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

      {/* ── CUSTOMER DETAIL SHEET (iPhone Apple Style Bottom Sheet) ── */}
      {selectedCustomerId && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => { setSelectedCustomerId(null); setShowAddTransaction(false); }}
          />

          {/* Bottom Sheet Panel */}
          <div className="relative w-full max-w-lg bg-zinc-900/95 border-t border-zinc-800 rounded-t-[32px] shadow-2xl p-4 overflow-hidden max-h-[85vh] flex flex-col z-10 animate-slide-up">
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
                <button
                  onClick={openEditCustomer}
                  className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDeleteCustomer}
                  className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
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

            {/* Transaction Form / List Toggle */}
            {showAddTransaction ? (
              <form onSubmit={handleAddTransactionSubmit} className="space-y-3 overflow-y-auto pr-1 flex-1 pb-20">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-bold text-xs">İşlem Ekle</span>
                  <button
                    type="button"
                    onClick={() => setShowAddTransaction(false)}
                    className="text-[10px] text-amber-500 font-bold"
                  >
                    Vazgeç
                  </button>
                </div>

                {/* Type Selection */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-950 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setTxType("debt")}
                    className={`py-2 text-[10px] font-semibold rounded-md transition-colors ${
                      txType === "debt" ? "bg-red-500 text-white" : "text-zinc-400"
                    }`}
                  >
                    Borç Ekle
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxType("payment")}
                    className={`py-2 text-[10px] font-semibold rounded-md transition-colors ${
                      txType === "payment" ? "bg-emerald-500 text-white" : "text-zinc-400"
                    }`}
                  >
                    Ödeme Al
                  </button>
                </div>

                {/* Metal Selection */}
                <div>
                  <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Birim</label>
                  <select
                    value={txMetalType}
                    onChange={(e) => setTxMetalType(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-2 text-[10px] text-white outline-none focus:border-amber-500/40"
                  >
                    {METAL_TYPES.map(m => (
                      <option key={m.code} value={m.code}>{m.label}</option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Miktar</label>
                  <input
                    type="number"
                    step="any"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/40"
                    required
                  />
                </div>

                {/* Note */}
                <div>
                  <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Not / Açıklama</label>
                  <input
                    type="text"
                    value={txNote}
                    onChange={(e) => setTxNote(e.target.value)}
                    placeholder="Örn: 22 Ayar Bilezik Emaneti"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/40"
                  />
                </div>

                {/* Due Date (Optional for Debt) */}
                {txType === "debt" && (
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Vade Tarihi (Opsiyonel)</label>
                    <input
                      type="date"
                      value={txDueDate}
                      onChange={(e) => setTxDueDate(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/40"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold py-2.5 rounded-lg transition-all shadow-lg shadow-amber-500/10 text-xs cursor-pointer"
                >
                  İşlemi Kaydet
                </button>
              </form>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2 flex-shrink-0">
                  <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">İşlem Geçmişi</span>
                  <button
                    onClick={() => setShowAddTransaction(true)}
                    className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-1 rounded-lg font-bold hover:bg-amber-500/25 transition-colors cursor-pointer"
                  >
                    + İşlem Ekle
                  </button>
                </div>

                {/* Transaction history list */}
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-0 pb-20">
                  {selectedCustomerTx && selectedCustomerTx.length === 0 ? (
                    <div className="py-8 text-center text-zinc-600">
                      <p className="text-[10px]">İşlem kaydı yok</p>
                    </div>
                  ) : (
                    selectedCustomerTx?.map((tx: any) => (
                      <div
                        key={tx._id}
                        onClick={() => setSelectedTransactionId(tx._id)}
                        className="bg-zinc-950/40 border border-zinc-900 rounded-lg p-2.5 flex items-center justify-between cursor-pointer hover:bg-zinc-900/60 transition-colors"
                      >
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
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="text-right">
                            <span className={`text-xs font-bold block ${
                              tx.type === "debt" ? "text-red-400" : "text-emerald-400"
                            }`}>
                              {tx.type === "debt" ? "" : "-"}{tx.amount} <span className="text-[9px] uppercase">{tx.metalType}</span>
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTransaction(tx._id);
                            }}
                            className="w-6 h-6 rounded-md bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── ADD CUSTOMER BOTTOM SHEET ── */}
      {showAddCustomer && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowAddCustomer(false)} />
          <div className="relative w-full max-w-lg bg-zinc-900 border-t border-zinc-800 rounded-t-[32px] shadow-2xl p-4 z-10 animate-slide-up">
            <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto mb-4" />
            <h2 className="text-lg font-bold text-white mb-4">Yeni Müşteri Ekle</h2>
            <form onSubmit={handleAddCustomer} className="space-y-3 pb-20">
              <div>
                <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Müşteri Adı</label>
                <input
                  type="text"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="Ad Soyad"
                  className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-900 rounded-lg focus:outline-none focus:border-amber-500/40 text-sm placeholder-zinc-650"
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Telefon Numarası</label>
                <input
                  type="tel"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  placeholder="05XXXXXXXXX"
                  className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-900 rounded-lg focus:outline-none focus:border-amber-500/40 text-sm placeholder-zinc-650"
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomer(false)}
                  className="flex-1 py-2.5 border border-zinc-800 rounded-lg text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-lg transition-colors text-xs shadow-lg shadow-amber-500/10 cursor-pointer"
                >
                  Müşteriyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT CUSTOMER BOTTOM SHEET ── */}
      {showEditCustomer && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowEditCustomer(false)} />
          <div className="relative w-full max-w-lg bg-zinc-900 border-t border-zinc-800 rounded-t-[32px] shadow-2xl p-4 z-10 animate-slide-up">
            <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto mb-4" />
            <h2 className="text-lg font-bold text-white mb-4">Müşteri Düzenle</h2>
            <form onSubmit={handleEditCustomer} className="space-y-3 pb-20">
              <div>
                <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Müşteri Adı</label>
                <input
                  type="text"
                  value={editCustomerName}
                  onChange={(e) => setEditCustomerName(e.target.value)}
                  placeholder="Ad Soyad"
                  className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-900 rounded-lg focus:outline-none focus:border-amber-500/40 text-sm placeholder-zinc-650"
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Telefon Numarası</label>
                <input
                  type="tel"
                  value={editCustomerPhone}
                  onChange={(e) => setEditCustomerPhone(e.target.value)}
                  placeholder="05XXXXXXXXX"
                  className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-900 rounded-lg focus:outline-none focus:border-amber-500/40 text-sm placeholder-zinc-650"
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Profil Fotoğrafı URL (Opsiyonel)</label>
                <input
                  type="url"
                  value={editCustomerImage}
                  onChange={(e) => setEditCustomerImage(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-900 rounded-lg focus:outline-none focus:border-amber-500/40 text-sm placeholder-zinc-650"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditCustomer(false)}
                  className="flex-1 py-2.5 border border-zinc-800 rounded-lg text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-lg transition-colors text-xs shadow-lg shadow-amber-500/10 cursor-pointer"
                >
                  Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TRANSACTION DETAIL BOTTOM SHEET ── */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedTransactionId(null)}
          />
          <div className="relative w-full max-w-lg bg-zinc-900/95 border-t border-zinc-800 rounded-t-[32px] shadow-2xl p-4 overflow-hidden max-h-[85vh] flex flex-col z-10">
            <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto mb-4 flex-shrink-0" />

            {/* Transaction Header */}
            <div className="flex items-start justify-between mb-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  selectedTransaction.type === "debt"
                    ? "bg-red-500/10 border border-red-500/20"
                    : "bg-emerald-500/10 border border-emerald-500/20"
                }`}>
                  {selectedTransaction.type === "debt" ? (
                    <ArrowUpRight className="w-6 h-6 text-red-400" />
                  ) : (
                    <ArrowDownLeft className="w-6 h-6 text-emerald-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">
                    {selectedTransaction.type === "debt" ? "Borç Kaydı" : "Ödeme"}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {new Date(selectedTransaction.createdAt).toLocaleString("tr-TR")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTransactionId(null)}
                className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-400 hover:text-white transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Amount Display */}
            <div className={`bg-zinc-950/60 border rounded-2xl p-4 mb-4 flex-shrink-0 ${
              selectedTransaction.type === "debt"
                ? "border-red-500/20"
                : "border-emerald-500/20"
            }`}>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Tutar</span>
              <div className={`text-3xl font-extrabold ${
                selectedTransaction.type === "debt" ? "text-red-400" : "text-emerald-400"
              }`}>
                {selectedTransaction.type === "debt" ? "" : "-"}{selectedTransaction.amount} <span className="text-lg uppercase">{selectedTransaction.metalType}</span>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 flex-1 overflow-y-auto pb-20">
              {selectedTransaction.note && (
                <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-3">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Not</span>
                  <p className="text-sm text-zinc-300">{selectedTransaction.note}</p>
                </div>
              )}

              {selectedTransaction.dueDate && (
                <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-3">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Vade Tarihi</span>
                  <p className="text-sm text-zinc-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    {new Date(selectedTransaction.dueDate).toLocaleString("tr-TR")}
                  </p>
                </div>
              )}

              <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-3">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">İşlem ID</span>
                <p className="text-xs text-zinc-500 font-mono">{selectedTransaction._id}</p>
              </div>

              <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-3">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Müşteri</span>
                <p className="text-sm text-zinc-300">{selectedCustomer?.name}</p>
                <p className="text-xs text-zinc-500">{selectedCustomer?.phone}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation 
        onQuickAddClick={() => setShowAddCustomer(true)}
        overdueCount={stats.totalOverdue}
      />
    </div>
  );
}
