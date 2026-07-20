import { Phone, MessageSquare, FileText, ChevronRight } from "lucide-react";

const debts = [
  { label: "22 Ayar Bilezik", amount: "15.50 gr", type: "Altın", date: "14 Eki 2026", positive: false },
  { label: "Çeyrek Altın", amount: "4 adet", type: "Çeyrek", date: "02 Eki 2026", positive: false },
  { label: "Ödeme Alındı", amount: "8.20 gr", type: "Altın", date: "18 Eyl 2026", positive: true },
];

export function AppPreview() {
  return (
    <section id="onizleme" className="relative border-t border-border/50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Uygulama Önizleme
            </p>
            <h2 className="font-display text-4xl leading-tight sm:text-5xl">
              Tek ekranda,
              <br />
              <span className="text-gradient-gold italic">tüm hesap</span>.
            </h2>
            <p className="mt-5 text-muted-foreground">
              Müşterinin adı, borç türü, miktarı ve tarihini net bir arayüzde görün.
              Gram altın, çeyrek, nakit — hepsi tek bir kartta, canlı kur ile.
            </p>
            <ul className="mt-8 space-y-3 text-sm">
              {[
                "Canlı gram altın çevirisi",
                "Ödeme ve borç hareketleri",
                "PDF ekstre çıktısı",
                "SMS ile tek tık hatırlatma",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-foreground/90">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mockup */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-gold opacity-20 blur-3xl" />
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-elegant">
              {/* Window chrome */}
              <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-primary/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-accent/60" />
                </div>
                <div className="mx-auto rounded-md bg-background px-3 py-1 text-[10px] font-mono text-muted-foreground">
                  altindefter.app / musteri / ahmet-yilmaz
                </div>
              </div>

              <div className="p-6">
                {/* Customer header */}
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-gold font-semibold text-primary-foreground">
                      AY
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-base font-semibold">Ahmet Yılmaz</div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        +90 555 000 00 00
                      </div>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-[10px] font-medium text-destructive">
                    Aktif Borç
                  </span>
                </div>

                {/* Balance */}
                <div className="mt-6 rounded-xl border border-border bg-surface p-5">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Toplam Borç (Gram Altın)
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-display text-4xl text-gradient-gold">15.50</span>
                    <span className="text-sm text-muted-foreground">gr · 22 ayar</span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    ≈ ₺ 68.420,00 <span className="text-accent">· güncel kur</span>
                  </div>
                </div>

                {/* Movements */}
                <div className="mt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Son Hareketler</span>
                    <span className="text-[10px] text-muted-foreground">3 kayıt</span>
                  </div>
                  <div className="space-y-2">
                    {debts.map((d) => (
                      <div
                        key={d.label}
                        className="flex items-center justify-between rounded-lg border border-border/70 bg-background/50 px-4 py-3 transition-colors hover:border-primary/30"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{d.label}</div>
                          <div className="text-[11px] text-muted-foreground">{d.date}</div>
                        </div>
                        <div
                          className={`shrink-0 text-sm font-semibold tabular-nums ${
                            d.positive ? "text-accent" : "text-foreground"
                          }`}
                        >
                          {d.positive ? "−" : "+"}
                          {d.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button className="flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-xs font-medium transition-colors hover:bg-surface-elevated">
                    <MessageSquare className="h-3.5 w-3.5" />
                    SMS Gönder
                  </button>
                  <button className="flex items-center justify-center gap-2 rounded-lg bg-gradient-gold px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-gold">
                    <FileText className="h-3.5 w-3.5" />
                    Ekstre Al
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
