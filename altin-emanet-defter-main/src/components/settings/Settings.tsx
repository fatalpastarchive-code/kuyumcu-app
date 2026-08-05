import React from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSettings } from "../providers/SettingsProvider";
import { useNotifications } from "../../providers/NotificationProvider";
import { useQuery } from "convex/react";
// @ts-ignore
import { api } from "@convex/_generated/api.js";
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Text,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText,
  Bell,
  Clock,
  Users
} from "lucide-react";

export function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme, largeTextMode, setLargeTextMode } = useSettings();
  const { settings: notificationSettings, updateSettings, permission, requestPermission, sendNotification } = useNotifications();
  const userId = "demo-user";
  const exportData = useQuery(api.customers.exportShopDataCSV, { clerkId: userId });

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

        {/* Notification Settings */}
        <div className="bg-zinc-900/60 backdrop-blur border border-zinc-900 rounded-2xl overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <Bell className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm text-zinc-100">Bildirim Ayarları</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Vade bildirimlerini yönet
                </p>
              </div>
              {permission === "granted" ? (
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-full font-semibold">
                  Aktif
                </span>
              ) : permission === "denied" ? (
                <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded-full font-semibold">
                  Engellendi
                </span>
              ) : (
                <button
                  onClick={requestPermission}
                  className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded-full font-semibold hover:bg-amber-500/20 transition-colors"
                >
                  İzin Ver
                </button>
              )}
            </div>

            {permission === "granted" && (
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                {/* Enable Notifications */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-xs text-zinc-200">Bildirimler</h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Vade bildirimlerini aç/kapat</p>
                  </div>
                  <button
                    onClick={() => updateSettings({ enabled: !notificationSettings.enabled })}
                    className="relative inline-flex h-8 w-14 items-center rounded-full bg-zinc-800 transition-colors focus:outline-none"
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-amber-500 transition-transform ${
                        notificationSettings.enabled ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Single vs Bulk */}
                {notificationSettings.enabled && (
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-xs text-zinc-200">Bildirim Türü</h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        {notificationSettings.singleNotification ? "Tekli bildirim" : "Toplu bildirim"}
                      </p>
                    </div>
                    <button
                      onClick={() => updateSettings({ singleNotification: !notificationSettings.singleNotification })}
                      className="relative inline-flex h-8 w-14 items-center rounded-full bg-zinc-800 transition-colors focus:outline-none"
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-amber-500 transition-transform ${
                          notificationSettings.singleNotification ? "translate-x-1" : "translate-x-7"
                        }`}
                      />
                      <span className="absolute left-2 text-[9px] font-bold text-zinc-400">
                        Tek
                      </span>
                      <span className="absolute right-2 text-[9px] font-bold text-zinc-400">
                        Çok
                      </span>
                    </button>
                  </div>
                )}

                {/* Notification Time */}
                {notificationSettings.enabled && (
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-xs text-zinc-200">Bildirim Saati</h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Günlük bildirim zamanı</p>
                    </div>
                    <input
                      type="time"
                      value={notificationSettings.notificationTime}
                      onChange={(e) => updateSettings({ notificationTime: e.target.value })}
                      className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/40"
                    />
                  </div>
                )}

                {/* Advance Notice */}
                {notificationSettings.enabled && (
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-xs text-zinc-200">Erken Bildirim</h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Vade öncesi gün sayısı</p>
                    </div>
                    <select
                      value={notificationSettings.advanceNotice}
                      onChange={(e) => updateSettings({ advanceNotice: parseInt(e.target.value) })}
                      className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/40"
                    >
                      <option value="0">Vade günü</option>
                      <option value="1">1 gün önce</option>
                      <option value="2">2 gün önce</option>
                      <option value="3">3 gün önce</option>
                      <option value="7">1 hafta önce</option>
                    </select>
                  </div>
                )}

                {/* Test Notification Button */}
                {notificationSettings.enabled && (
                  <div className="pt-2 border-t border-zinc-800/80">
                    <button
                      onClick={() => {
                        sendNotification(
                          "Test Bildirimi 🔔",
                          "Altın Defter vade bildirim sistemi sorunsuz çalışıyor!"
                        );
                      }}
                      className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      Test Bildirimi Gönder
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Logs */}
        <div className="bg-zinc-900/60 backdrop-blur border border-zinc-900 rounded-2xl overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <FileText className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-100">İşlem Logları</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Tüm işlemleri görüntüle
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate({ to: "/logs" })}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors text-xs"
            >
              <ChevronRight className="w-4 h-4" />
              Git
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
