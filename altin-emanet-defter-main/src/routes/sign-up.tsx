import { createFileRoute } from "@tanstack/react-router";
import { SignUp } from "@clerk/clerk-react";
import { Shield, TrendingUp, Users, Bell } from "lucide-react";

export const Route = createFileRoute("/sign-up")({
  ssr: false,
  component: SignUpPage,
});

const clerkAppearance = {
  variables: {
    colorPrimary: "#f59e0b",
    colorBackground: "#18181b",
    colorInputBackground: "#09090b",
    colorInputText: "#ffffff",
    colorText: "#ffffff",
    colorTextSecondary: "#a1a1aa",
    colorNeutral: "#71717a",
    borderRadius: "0.75rem",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  elements: {
    card: {
      background: "transparent",
      boxShadow: "none",
      border: "none",
      padding: "0",
    },
    rootBox: {
      width: "100%",
    },
    headerTitle: {
      color: "#ffffff",
      fontSize: "1.5rem",
      fontWeight: "700",
    },
    headerSubtitle: {
      color: "#a1a1aa",
    },
    socialButtonsBlockButton: {
      background: "#27272a",
      border: "1px solid #3f3f46",
      color: "#ffffff",
      transition: "all 0.2s",
    },
    socialButtonsBlockButtonText: {
      color: "#ffffff",
      fontWeight: "600",
    },
    dividerLine: {
      background: "#3f3f46",
    },
    dividerText: {
      color: "#71717a",
    },
    formFieldLabel: {
      color: "#a1a1aa",
      fontSize: "0.8rem",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    formFieldInput: {
      background: "#09090b",
      border: "1px solid #3f3f46",
      color: "#ffffff",
      borderRadius: "0.75rem",
      padding: "0.75rem 1rem",
    },
    formButtonPrimary: {
      background: "linear-gradient(135deg, #f59e0b, #d97706)",
      color: "#09090b",
      fontWeight: "700",
      borderRadius: "0.75rem",
      padding: "0.85rem",
      boxShadow: "0 4px 24px rgba(245,158,11,0.25)",
    },
    footerActionLink: {
      color: "#f59e0b",
      fontWeight: "600",
    },
    footerActionText: {
      color: "#71717a",
    },
    footer: {
      background: "transparent",
    },
  },
};

const features = [
  {
    icon: Shield,
    title: "Güvenli & Şifreli",
    desc: "Verileriniz Convex altyapısında uçtan uca şifrelenerek korunur.",
  },
  {
    icon: TrendingUp,
    title: "Gerçek Zamanlı Bakiye",
    desc: "Altın, çeyrek ve TL borçlarını anlık olarak takip edin.",
  },
  {
    icon: Users,
    title: "Ekip Yönetimi",
    desc: "Dükkan sahibi ve personel rolleriyle çoklu kullanıcı desteği.",
  },
  {
    icon: Bell,
    title: "Vade Hatırlatıcı",
    desc: "Yaklaşan vadeler için otomatik bildirim ve SMS desteği.",
  },
];

function SignUpPage() {
  return (
    <div className="min-h-[100dvh] bg-zinc-950 flex">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative flex-col justify-between p-12 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(245,158,11,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.5) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
          <div className="absolute top-20 right-20 w-2 h-2 bg-amber-500 rounded-full opacity-60 animate-pulse" />
          <div className="absolute top-1/3 right-32 w-1.5 h-1.5 bg-yellow-400 rounded-full opacity-40 animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-1/3 left-20 w-2 h-2 bg-amber-400 rounded-full opacity-50 animate-pulse" style={{ animationDelay: "2s" }} />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <span className="font-extrabold text-zinc-950 text-sm tracking-tight">AD</span>
          </div>
          <span className="font-bold text-xl text-white tracking-tight">Altın Defter</span>
        </div>

        {/* Hero */}
        <div className="relative z-10 space-y-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
              Ücretsiz Başlayın
            </div>
            <h1 className="text-5xl xl:text-6xl font-extrabold tracking-tight leading-tight">
              <span className="text-white">Dükkanınızı</span>
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                kayıt altına alın.
              </span>
            </h1>
            <p className="text-zinc-400 text-lg leading-relaxed max-w-md">
              Dakikalar içinde hesabınızı oluşturun. Müşteri borçlarını, altın ve döviz alacaklarınızı güvenle yönetmeye hemen başlayın.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group bg-zinc-900/60 backdrop-blur border border-zinc-800/60 rounded-xl p-4 hover:border-amber-500/30 hover:bg-zinc-900/80 transition-all duration-300"
              >
                <div className="w-8 h-8 bg-amber-500/10 text-amber-500 rounded-lg flex items-center justify-center mb-3 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-all duration-300">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-white text-sm font-semibold mb-1">{title}</div>
                <div className="text-zinc-500 text-xs leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-8 pt-6 border-t border-zinc-800/60">
          {[
            { label: "Aktif Dükkan", value: "500+" },
            { label: "İşlenen Borç", value: "₺50M+" },
            { label: "Günlük Bildirim", value: "2,000+" },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-xl font-bold text-amber-400">{value}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col items-center justify-center p-8 md:p-12 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        </div>

        {/* Mobile logo */}
        <div className="lg:hidden flex flex-col items-center mb-8 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-3">
            <span className="font-extrabold text-zinc-950">AD</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Altın Defter</h1>
          <p className="text-zinc-400 text-sm mt-1 text-center">Kuyumcular İçin Dijital Veresiye Defteri</p>
        </div>

        <div className="hidden lg:block absolute left-0 top-16 bottom-16 w-px bg-gradient-to-b from-transparent via-zinc-800 to-transparent" />

        <div className="relative z-10 w-full max-w-sm">
          <div className="mb-6 hidden lg:block">
            <h2 className="text-2xl font-bold text-white">Hesap Oluşturun</h2>
            <p className="text-zinc-500 text-sm mt-1">Dakikalar içinde dükkanınızı kayıt altına alın</p>
          </div>

          <SignUp
            signInUrl="/welcome"
            forceRedirectUrl="/dashboard"
            fallbackRedirectUrl="/dashboard"
            appearance={clerkAppearance}
          />
        </div>

        <p className="relative z-10 mt-8 text-xs text-zinc-600 text-center">
          © {new Date().getFullYear()} Altın Defter · Güvenli & Şifreli
        </p>
      </div>
    </div>
  );
}
