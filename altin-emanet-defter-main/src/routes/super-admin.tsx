import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Shield, Users, Building2, Plus, Edit, Trash2, Clock, CheckCircle2, X } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export const Route = createFileRoute("/super-admin")({
  component: SuperAdmin,
});

function SuperAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showCreateShopModal, setShowCreateShopModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [assignShopId, setAssignShopId] = useState<Record<string, string>>({});

  const allShops = useQuery(api.admin.getAllShops);
  const allUsers = useQuery(api.admin.getAllUsers);
  const createShopAdmin = useMutation(api.admin.createShopAdmin);
  const updateUserAdmin = useMutation(api.admin.updateUserAdmin);
  const deleteShopAdmin = useMutation(api.admin.deleteShopAdmin);
  const deleteUserAdmin = useMutation(api.admin.deleteUserAdmin);
  const clearDatabase = useMutation(api.admin.clearEntireDatabase);

  // Pending staff = role:"staff" and status:"pending" or no shopId
  const pendingUsers = allUsers?.filter(
    (u: any) => u.status === "pending" || (!u.shopId && u.role !== "owner")
  );
  const activeUsers = allUsers?.filter(
    (u: any) => u.status !== "pending" || u.shopId
  );

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "lioncode") {
      setIsAuthenticated(true);
      setPassword("");
    } else {
      toast.error("Hatalı şifre");
      setPassword("");
    }
  };

  const handleClearDatabase = async () => {
    if (
      !confirm(
        "DİKKAT: Veritabanındaki tüm dükkanlar, kullanıcılar, müşteriler ve işlemler kalıcı olarak silinecektir. Bu işlem GERİ ALINAMAZ. Devam etmek istiyor musunuz?"
      )
    ) {
      return;
    }

    try {
      await clearDatabase();
      toast.success("Veritabanı başarıyla tamamen temizlendi!");
      window.location.reload();
    } catch (err: any) {
      toast.error("Temizleme sırasında hata: " + err.message);
    }
  };

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const ownerEmail = (form.elements.namedItem("ownerEmail") as HTMLInputElement).value;
    const ownerName = (form.elements.namedItem("ownerName") as HTMLInputElement).value;

    try {
      await createShopAdmin({ name, ownerEmail, ownerName });
      toast.success("Dükkan oluşturuldu");
      setShowCreateShopModal(false);
      form.reset();
    } catch (err: any) {
      toast.error("Hata: " + err.message);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const role = (form.elements.namedItem("role") as HTMLSelectElement).value;
    const shopIdValue = (form.elements.namedItem("shopId") as HTMLSelectElement).value;

    try {
      await updateUserAdmin({
        userId: selectedUser._id,
        role,
        shopId: shopIdValue ? (shopIdValue as any) : undefined,
        status: "active",
      });
      toast.success("Kullanıcı güncellendi");
      setShowEditUserModal(false);
      setSelectedUser(null);
    } catch (err: any) {
      toast.error("Hata: " + err.message);
    }
  };

  const handleAssignPendingUser = async (user: any) => {
    const shopId = assignShopId[user._id];
    if (!shopId) {
      toast.error("Lütfen bir dükkan seçin");
      return;
    }
    try {
      await updateUserAdmin({
        userId: user._id,
        role: user.role || "staff",
        shopId: shopId as any,
        status: "active",
      });
      toast.success(`${user.name || user.email} başarıyla dükkana atandı ve aktifleştirildi!`);
      setAssignShopId(prev => {
        const next = { ...prev };
        delete next[user._id];
        return next;
      });
    } catch (err: any) {
      toast.error("Hata: " + err.message);
    }
  };

  const handleDeleteShop = async (shopId: any) => {
    if (!confirm("Bu dükkanı ve tüm verilerini silmek istediğine emin misin? Bu işlem geri alınamaz.")) return;

    try {
      await deleteShopAdmin({ shopId: shopId as any });
      toast.success("Dükkan silindi");
    } catch (err: any) {
      console.error("Delete shop error:", err);
      toast.error("Hata: " + (err.message || "Bilinmeyen hata"));
    }
  };

  const handleDeleteUser = async (userId: any) => {
    if (!confirm("Bu kullanıcıyı silmek istediğine emin misin?")) return;

    try {
      await deleteUserAdmin({ userId: userId as any });
      toast.success("Kullanıcı silindi");
    } catch (err: any) {
      console.error("Delete user error:", err);
      toast.error("Hata: " + (err.message || "Bilinmeyen hata"));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-zinc-950" />
            </div>
            <h1 className="text-2xl font-bold text-white">Süper Admin Paneli</h1>
            <p className="text-zinc-500 text-sm mt-2">Güvenli erişim için şifre girin</p>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifre"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold py-3 rounded-xl transition-colors"
            >
              Giriş Yap
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-amber-500" />
            <h1 className="text-3xl font-bold text-white">Süper Admin Paneli</h1>
          </div>
          <button
            onClick={handleClearDatabase}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-red-600/10 flex items-center justify-center gap-2 cursor-pointer border border-red-500/20"
          >
            <Trash2 className="w-4 h-4" />
            Tüm Veritabanını Sıfırla
          </button>
        </div>

        {/* ── PENDING STAFF SECTION ── */}
        {pendingUsers && pendingUsers.length > 0 && (
          <div className="bg-zinc-900 border border-amber-500/30 rounded-xl p-6 shadow-lg shadow-amber-500/5">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-semibold text-white">
                Bekleyen Personeller
                <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-amber-500 text-zinc-950 rounded-full">
                  {pendingUsers.length}
                </span>
              </h2>
            </div>
            <div className="space-y-3">
              {pendingUsers.map((user: any) => (
                <div
                  key={user._id}
                  className="bg-zinc-800/70 border border-zinc-700/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">{user.name || "İsimsiz"}</div>
                    <div className="text-xs text-zinc-400 truncate">{user.email}</div>
                    <div className="mt-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Clock className="w-2.5 h-2.5" />
                        Onay Bekliyor
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={assignShopId[user._id] || ""}
                      onChange={(e) => setAssignShopId(prev => ({ ...prev, [user._id]: e.target.value }))}
                      className="bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 min-w-[160px]"
                    >
                      <option value="">Dükkan seç...</option>
                      {allShops?.map((shop: any) => (
                        <option key={shop._id} value={shop._id}>{shop.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAssignPendingUser(user)}
                      disabled={!assignShopId[user._id]}
                      className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Ata ve Onayla
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shops Section */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-semibold text-white">Dükkanlar</h2>
              </div>
              <button
                onClick={() => setShowCreateShopModal(true)}
                className="bg-amber-500 hover:bg-amber-600 text-zinc-950 p-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {allShops?.map((shop: any) => (
                <div
                  key={shop._id}
                  className="bg-zinc-800 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-white">{shop.name}</div>
                    <div className="text-xs text-zinc-500">ID: {shop._id}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-zinc-500">
                      {new Date(shop.createdAt).toLocaleDateString("tr-TR")}
                    </div>
                    <button
                      onClick={() => handleDeleteShop(shop._id)}
                      className="text-red-500 hover:text-red-400 p-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Users Section */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-semibold text-white">Tüm Kullanıcılar</h2>
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {allUsers?.map((user: any) => (
                <div
                  key={user._id}
                  className="bg-zinc-800 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">{user.name || "İsimsiz"}</div>
                    <div className="text-xs text-zinc-500 truncate">{user.email}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-amber-500">{user.role}</span>
                      {user.status === "pending" && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
                          beklemede
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEditUserModal(true);
                      }}
                      className="text-zinc-500 hover:text-white p-2 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-500 hover:text-red-400 p-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Create Shop Modal */}
        {showCreateShopModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-zinc-900 w-full max-w-md rounded-2xl border border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Yeni Dükkan Oluştur</h2>
                <button
                  onClick={() => setShowCreateShopModal(false)}
                  className="text-zinc-500 hover:text-zinc-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateShop} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Dükkan Adı
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="Dükkan Adı"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Sahip E-posta
                  </label>
                  <input
                    name="ownerEmail"
                    type="email"
                    required
                    placeholder="ornek@email.com"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Sahip Adı
                  </label>
                  <input
                    name="ownerName"
                    type="text"
                    required
                    placeholder="Ad Soyad"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold py-3 rounded-xl transition-colors"
                >
                  Dükkan Oluştur
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditUserModal && selectedUser && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-zinc-900 w-full max-w-md rounded-2xl border border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Kullanıcı Düzenle</h2>
                <button
                  onClick={() => {
                    setShowEditUserModal(false);
                    setSelectedUser(null);
                  }}
                  className="text-zinc-500 hover:text-zinc-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Kullanıcı
                  </label>
                  <div className="bg-zinc-800 rounded-lg px-4 py-3 text-white">
                    {selectedUser.name} ({selectedUser.email})
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Rol
                  </label>
                  <select
                    name="role"
                    defaultValue={selectedUser.role}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="owner">Owner</option>
                    <option value="manager">Manager</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Dükkan Ataması
                  </label>
                  <select
                    name="shopId"
                    defaultValue={selectedUser.shopId}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="">Seçiniz</option>
                    {allShops?.map((shop: any) => (
                      <option key={shop._id} value={shop._id}>
                        {shop.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold py-3 rounded-xl transition-colors"
                >
                  Güncelle
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

