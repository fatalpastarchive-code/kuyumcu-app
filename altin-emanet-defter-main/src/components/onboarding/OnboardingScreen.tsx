import React, { useState } from "react";
import { useMutation } from "convex/react";
// @ts-ignore
import { api } from "@convex/_generated/api.js";
import { Building2, Users, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@clerk/clerk-react";

export function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [role, setRole] = useState<"owner" | "staff" | null>(null);
  const [shopName, setShopName] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { userId } = useAuth();

  const onboardOwner = useMutation(api.users.onboardOwner);
  const onboardStaff = useMutation(api.users.onboardStaff);

  const handleOwnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim()) {
      toast.error("Lütfen dükkan adını girin.");
      return;
    }

    if (!userId) {
      toast.error("Giriş yapılmadı. Lütfen tekrar giriş yapın.");
      return;
    }

    setLoading(true);
    try {
      await onboardOwner({ shopName: shopName.trim() });
      toast.success("Dükkanınız başarıyla oluşturuldu!");
      onComplete();
    } catch (err: any) {
      toast.error("Hata: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error("Giriş yapılmadı. Lütfen tekrar giriş yapın.");
      return;
    }

    setLoading(true);
    try {
      await onboardStaff({ name: name.trim() || undefined });
      toast.success("Personel kaydınız oluşturuldu, onay bekleniyor.");
      onComplete();
    } catch (err: any) {
      toast.error("Hata: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Hoş Geldiniz 👋</h1>
          <p className="text-gray-400">Devam etmek için rolünüzü seçin</p>
        </div>

        {!role ? (
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => setRole("owner")}
              className="bg-gray-800 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow text-left group border border-gray-700"
            >
              <div className="w-12 h-12 bg-amber-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-900/50 transition-colors">
                <Building2 className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Dükkan Sahibiyim</h3>
              <p className="text-gray-400 text-sm">
                Kendi dükkanınızı oluşturun ve yönetin
              </p>
            </button>

            <button
              onClick={() => setRole("staff")}
              className="bg-gray-800 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow text-left group border border-gray-700"
            >
              <div className="w-12 h-12 bg-blue-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-900/50 transition-colors">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Personelim</h3>
              <p className="text-gray-400 text-sm">
                Mevcut bir dükkana personel olarak katılın
              </p>
            </button>
          </div>
        ) : role === "owner" ? (
          <div className="bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
            <button
              onClick={() => setRole(null)}
              className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
            >
              ← Geri
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Dükkan Oluştur</h2>
            <form onSubmit={handleOwnerSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Dükkan Adı
                </label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="Örn: Altın Kuyum"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-white placeholder-gray-400"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 text-white py-3 rounded-lg font-medium hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    Dükkanı Aç ve Başla
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
            <button
              onClick={() => setRole(null)}
              className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
            >
              ← Geri
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Personel Kaydı</h2>
            <form onSubmit={handleStaffSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Adınız (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Adınız"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-white placeholder-gray-400"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    Kaydol ve Onay Bekle
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
