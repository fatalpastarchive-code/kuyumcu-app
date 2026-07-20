import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { useAuth, useUser } from "@clerk/clerk-react";
// @ts-ignore
import { api } from "../../convex/_generated/api.js";

export function useSyncUser() {
  const { isLoaded, userId } = useAuth();
  const { user: clerkUser } = useUser();
  const syncUser = useMutation(api.users.syncUser);
  const syncCalled = useRef(false);

  useEffect(() => {
    if (!isLoaded || !userId || syncCalled.current) return;

    const sync = async () => {
      syncCalled.current = true;
      try {
        const clerkId = userId;
        const clerkEmail = clerkUser?.emailAddresses?.[0]?.emailAddress || clerkUser?.primaryEmailAddress?.emailAddress || "";
        const clerkName = clerkUser?.fullName || clerkUser?.firstName || "";
        
        console.log("Syncing user:", { clerkId, clerkEmail, clerkName });
        await syncUser({ clerkId, email: clerkEmail, name: clerkName });
      } catch (error) {
        console.error("Failed to sync user:", error);
        syncCalled.current = false; // Retry on error
      }
    };

    sync();
  }, [isLoaded, userId, clerkUser, syncUser]);

  return { isLoaded, userId };
}
