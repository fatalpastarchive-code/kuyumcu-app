import React, { useEffect, useState } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProvider } from "convex/react";

const convexUrl = import.meta.env.VITE_CONVEX_URL || "";

// Client-side instance
let convexClient: ConvexReactClient | null = null;
if (typeof window !== "undefined") {
  convexClient = new ConvexReactClient(convexUrl);
}

export function ConvexAuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR veya hydration bitene kadar provider'sız render et (Hydration Mismatch'i önler)
  if (!mounted || !convexClient) {
    return <div className="min-h-screen bg-zinc-950" />;
  }

  return (
    <ConvexProvider client={convexClient}>
      {children}
    </ConvexProvider>
  );
}
