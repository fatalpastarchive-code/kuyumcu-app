import { useState, type FormEvent } from "react";
import { Logo } from "./Logo";
import { Mail, ArrowRight } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
    setEmail("");
  };

  return (
    <footer className="border-t border-border/50 bg-surface/30">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Kuyumcular ve yerel esnaf için geliştirilen dijital veresiye defteri.
              Güvenli, hızlı, akıllı.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground">Gizlilik</a>
              <a href="#" className="hover:text-foreground">Şartlar</a>
              <a href="mailto:merhaba@altindefter.app" className="hover:text-foreground">
                merhaba@altindefter.app
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-1 text-sm font-semibold">E-Bülten</div>
            <p className="text-xs text-muted-foreground">
              Güncellemeleri ve yeni özellikleri e-postanıza alın.
            </p>
            <form onSubmit={submit} className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@eposta.com"
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60"
                />
              </div>
              <button
                type="submit"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-gradient-gold px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
              >
                Katıl
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            {sent && (
              <p className="mt-2 text-xs text-accent">Teşekkürler! Kaydınız alındı.</p>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border/50 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <div>© {new Date().getFullYear()} AltınDefter. Tüm hakları saklıdır.</div>
          <div>Türkiye'de tasarlandı ve geliştirildi.</div>
        </div>
      </div>
    </footer>
  );
}
