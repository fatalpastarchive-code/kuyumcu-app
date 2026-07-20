import { ShieldCheck, TrendingUp, Lock } from "lucide-react";

const items = [
  {
    icon: ShieldCheck,
    title: "Sıfır Kayıp Riski",
    desc: "Yangın, su baskını veya defterin kaybolması durumunda bile verileriniz güvende. Otomatik yedekleme ile bir tıkla erişim.",
    accent: "emerald",
  },
  {
    icon: TrendingUp,
    title: "Anlık Altın & Kur Entegrasyonu",
    desc: "Borçları TL, Dolar, Euro veya direkt Gram Altın cinsinden kaydedin. Kur farkından zarar etmeyin, canlı fiyatlarla çalışın.",
    accent: "gold",
  },
  {
    icon: Lock,
    title: "Gizlilik ve Güvenlik",
    desc: "Müşteri bilgileri sadece sizin erişebileceğiniz yüksek güvenlikli uçtan uca şifreleme ile korunur.",
    accent: "emerald",
  },
] as const;

export function Problems() {
  return (
    <section id="ozellikler" className="relative border-t border-border/50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Neden AltınDefter
          </p>
          <h2 className="font-display text-4xl leading-tight sm:text-5xl">
            Kağıt defterin bittiği yerde,
            <br />
            <span className="text-gradient-gold italic">güven başlar.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Esnafın yıllardır yaşadığı üç büyük problemin dijital çözümü.
          </p>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/40 hover:shadow-elegant"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/5 blur-3xl transition-opacity group-hover:opacity-100" />
                <div
                  className={`mb-6 inline-grid h-12 w-12 place-items-center rounded-xl border ${
                    item.accent === "gold"
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-accent/30 bg-accent/10 text-accent"
                  }`}
                >
                  <Icon className="h-6 w-6" strokeWidth={2} />
                </div>
                <h3 className="mb-3 text-xl font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
