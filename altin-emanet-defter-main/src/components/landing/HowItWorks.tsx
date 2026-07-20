import { UserPlus, Lock, Send } from "lucide-react";
import { Link } from "@tanstack/react-router";

const steps = [
  {
    n: "01",
    icon: UserPlus,
    title: "Müşteri ve Borç Türünü Seçin",
    desc: "Kayıtlı müşterinizi seçin veya yeni bir müşteri ekleyin. Borç türünü belirleyin: Gram Altın, Çeyrek veya Nakit.",
  },
  {
    n: "02",
    icon: Lock,
    title: "Güvenli Şifreleme ile Kaydedin",
    desc: "Tüm kayıtlar 256-bit uçtan uca şifreleme ile bulut sunucularında saklanır. Sadece siz erişebilirsiniz.",
  },
  {
    n: "03",
    icon: Send,
    title: "SMS veya Rapor ile Paylaşın",
    desc: "İster müşteriye SMS ile bilgilendirme gönderin, ister tek tıkla PDF ekstre alın. Hepsi saniyeler içinde.",
  },
];

export function HowItWorks() {
  return (
    <section id="nasil-calisir" className="relative border-t border-border/50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Nasıl Çalışır
          </p>
          <h2 className="font-display text-4xl leading-tight sm:text-5xl">
            <span className="text-gradient-gold italic">Üç adımda</span> dijital defter.
          </h2>
        </div>

        <div className="relative mt-16 grid gap-5 md:grid-cols-3">
          {/* connecting line */}
          <div className="pointer-events-none absolute top-16 left-[15%] right-[15%] hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent md:block" />
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.n}
                className="relative rounded-2xl border border-border bg-card p-8"
              >
                <div className="relative z-10 mb-6 grid h-14 w-14 place-items-center rounded-xl border border-primary/30 bg-background text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="absolute right-6 top-6 font-display text-5xl leading-none text-primary/10">
                  {s.n}
                </div>
                <h3 className="mb-2 text-lg font-semibold tracking-tight">{s.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-surface to-background p-10 text-center sm:p-16">
          <h3 className="mx-auto max-w-2xl font-display text-3xl leading-tight sm:text-4xl">
            Bugün başlayın. <span className="text-gradient-gold italic">Defterinizi kaybetmeyin.</span>
          </h3>
          <p className="mx-auto mt-4 max-w-lg text-sm text-muted-foreground">
            14 gün ücretsiz — kredi kartı gerekmez. Kurulum 2 dakikadan az sürer.
          </p>
          <Link
            to="/auth"
            className="btn-gold-shimmer mt-8 inline-flex items-center gap-2 rounded-xl px-8 py-4 text-sm font-semibold text-primary-foreground shadow-gold"
          >
            Hemen Ücretsiz Deneyin
          </Link>
        </div>
      </div>
    </section>
  );
}
