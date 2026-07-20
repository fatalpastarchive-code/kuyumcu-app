import { Logo } from "./Logo";
import { Link } from "@tanstack/react-router";
import { useSession } from "@/lib/use-session";
import { User } from "lucide-react";

const links = [
  { href: "#ozellikler", label: "Özellikler" },
  { href: "#onizleme", label: "Önizleme" },
  { href: "#nasil-calisir", label: "Nasıl Çalışır" },
];

export function Nav() {
  const session = useSession();
  const signedIn = !!session;

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {signedIn ? (
            <>
              <Link
                to="/dashboard"
                className="rounded-lg bg-gradient-gold px-4 py-2 text-sm font-semibold text-primary-foreground shadow-gold"
              >
                Panel'e Git
              </Link>
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-zinc-950 font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className="hidden rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground sm:inline"
              >
                Giriş Yap
              </Link>
              <Link
                to="/sign-up"
                className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-all hover:border-primary/60 hover:bg-primary/20"
              >
                Ücretsiz Dene
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
