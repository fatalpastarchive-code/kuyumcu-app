import { ArrowRight, PlayCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Hero() {
  return (
    <section id="cta" className="relative overflow-hidden bg-hero-glow">
      {/* grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div className="mx-auto max-w-4xl text-center animate-fade-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Kuyumcular ve Yerel Esnaf İçin
          </div>

          <h1 className="font-display text-5xl leading-[1.05] text-foreground sm:text-6xl md:text-7xl">
            Defterler Kaybolur,
            <br />
            <span className="text-gradient-gold italic">Altının Hesabı</span> Şaşmaz.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Kuyumcular ve yerel esnaf için özel olarak geliştirildi. Karışıklığa,
            hesap hatalarına ve kaybolan defter zararlarına son verin.
            Bilgileriniz bulut altyapısıyla{" "}
            <span className="text-foreground font-medium">%100 güvende</span>.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/sign-up"
              className="btn-gold-shimmer group inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
            >
              Hemen Ücretsiz Deneyin
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#nasil-calisir"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-7 py-3.5 text-sm font-medium text-foreground transition-all hover:border-foreground/30 hover:bg-surface-elevated"
            >
              <PlayCircle className="h-4 w-4" />
              Nasıl Çalışır?
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-accent" />
              256-bit Şifreleme
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-accent" />
              14 Gün Ücretsiz Deneme
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-accent" />
              Kredi Kartı Gerekmez
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
