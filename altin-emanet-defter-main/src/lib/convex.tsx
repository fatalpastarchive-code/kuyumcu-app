import React, { useEffect, useState, useMemo } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProvider } from "convex/react";

export function ConvexAuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [convexClient, setConvexClient] = useState<ConvexReactClient | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Only initialize on client-side after mount
    if (typeof window !== "undefined") {
      const convexUrl = import.meta.env.VITE_CONVEX_URL;
      
      if (!convexUrl) {
        console.error("VITE_CONVEX_URL environment variable is not set. Please check your .env.local file.");
        return;
      }
      
      try {
        const client = new ConvexReactClient(convexUrl);
        setConvexClient(client);
      } catch (error) {
        console.error("Failed to initialize Convex client:", error);
      }
    }
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
