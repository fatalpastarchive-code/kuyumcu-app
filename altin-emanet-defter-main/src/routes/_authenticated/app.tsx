import { createFileRoute, Outlet, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { LogOut, Users, BookOpen } from "lucide-react";
import { Logo } from "@/components/landing/Logo";
import { NotificationsBell } from "@/components/app/NotificationsBell";

export const Route = createFileRoute("/_authenticated/app")({
  component: AppLayout,
});

function AppLayout() {
  const navigate = useNavigate();
  const router = useRouter();

  const signOut = async () => {
    localStorage.removeItem("unlockedDate");
    router.invalidate();
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link to="/app"><Logo /></Link>
            <nav className="hidden gap-4 md:flex">
              <Link
                to="/app"
                activeOptions={{ exact: true }}
                className="flex items-center gap-1.5 text-sm text-muted-foreground [&.active]:text-foreground"
              >
                <Users className="h-3.5 w-3.5" /> Müşteriler
              </Link>
              <a href="/#nasil-calisir" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                <BookOpen className="h-3.5 w-3.5" /> Yardım
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <NotificationsBell userId="user" />
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs hover:bg-surface-elevated"
            >
              <LogOut className="h-3.5 w-3.5" /> Çıkış
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
