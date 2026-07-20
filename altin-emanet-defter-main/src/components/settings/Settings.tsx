import React from "react";
import { useSettings } from "../providers/SettingsProvider";
import { useQuery } from "convex/react";
// @ts-ignore
import { api } from "@convex/_generated/api.js";
import { useAuth } from "@clerk/clerk-react";
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Text,
  ChevronRight,
  Download,
  FileSpreadsheet
} from "lucide-react";

export function Settings() {
  const { theme, setTheme, largeTextMode, setLargeTextMode } = useSettings();
  const { userId } = useAuth();
  const exportData = useQuery(api.customers.exportShopDataCSV, userId ? { clerkId: userId } : "skip");

  const handleExportData = () => {
    if (exportData) {
      const blob = new Blob([exportData], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `veriler_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-amber-500 selection:text-black pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-900/60 py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <SettingsIcon className="w-5 h-5 text-zinc-950" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">Ayarlar</h1>
            <p className="text-[10px] text-amber-500 font-semibold tracking-widest uppercase -mt-1">
              Uygulama Ayarları
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Theme Toggle */}
        <div className="bg-zinc-900/60 backdrop-blur border border-zinc-900 rounded-2xl overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                {theme === "dark" ? (
                  <Moon className="w-5 h-5 text-amber-400" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-100">
                  {theme === "dark" ? "Koyu Tema" : "Aydınlık Tema"}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {theme === "dark" 
                    ? "Göz yormayan koyu mod" 
                    : "Yüksek kontrastlı aydınlık mod"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative inline-flex h-12 w-20 items-center rounded-full bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
            >
              <span
                className={`inline-block h-10 w-10 transform rounded-full bg-amber-500 transition-transform ${
                  theme === "dark" ? "translate-x-1" : "translate-x-9"
                }`}
              />
              <span className="absolute left-2 text-xs font-bold text-zinc-400">
                Koyu
              </span>
              <span className="absolute right-2 text-xs font-bold text-zinc-400">
                Aydınlık
              </span>
            </button>
          </div>
        </div>

        {/* Large Text Mode Toggle */}
        <div className="bg-zinc-900/60 backdrop-blur border border-zinc-900 rounded-2xl overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <Text className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-100">Büyük Yazı Modu</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {largeTextMode
                    ? "Büyük yazı aktif"
                    : "Okunabilirlik için büyük yazı"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setLargeTextMode(!largeTextMode)}
              className="relative inline-flex h-12 w-20 items-center rounded-full bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
            >
              <span
                className={`inline-block h-10 w-10 transform rounded-full bg-amber-500 transition-transform ${
                  largeTextMode ? "translate-x-9" : "translate-x-1"
                }`}
              />
              <span className="absolute left-2 text-xs font-bold text-zinc-400">
                Kapalı
              </span>
              <span className="absolute right-2 text-xs font-bold text-zinc-400">
                Açık
              </span>
            </button>
          </div>
        </div>

        {/* Export Data */}
        <div className="bg-zinc-900/60 backdrop-blur border border-zinc-900 rounded-2xl overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-100">Verileri Dışa Aktar</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Müşteri ve işlem verilerini CSV olarak indir
                </p>
              </div>
            </div>
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl transition-colors text-xs"
            >
              <Download className="w-4 h-4" />
              İndir
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-zinc-900/40 border border-zinc-900/60 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ChevronRight className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-zinc-300 mb-1">Erişilebilirlik</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Bu ayarlar uygulamanın tüm ekranlarında geçerlidir. Büyük yazı modu, 
                özellikle müşteri isimleri ve telefon numaraları gibi önemli bilgileri 
                daha okunabilir hale getirir.
              </p>
            </div>
          </div>
        </div>

        {/* Version Info */}
        <div className="text-center pt-4">
          <p className="text-[10px] text-zinc-600">
            Altın Defter v1.0 · Güvenli & Şifreli
          </p>
        </div>
      </main>
    </div>
  );
}
