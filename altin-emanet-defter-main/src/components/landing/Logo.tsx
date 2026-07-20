import { Coins } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-gold shadow-gold">
        <Coins className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
      </div>
      <span className="font-display text-xl font-medium tracking-tight">
        Altın<span className="text-gradient-gold">Defter</span>
      </span>
    </div>
  );
}
