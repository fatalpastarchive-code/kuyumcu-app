import { useEffect, useState } from "react";

export function useSession() {
  const [session, setSession] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    // Simple session check using localStorage
    const unlockedDate = localStorage.getItem("unlockedDate");
    const today = new Date().toISOString().split("T")[0];
    setSession(unlockedDate === today ? "authenticated" : null);
  }, []);

  return session;
}
