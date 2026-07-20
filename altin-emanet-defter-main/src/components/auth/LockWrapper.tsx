"use client";

import { useEffect } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";

export function LockWrapper({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const unlockedDate = localStorage.getItem("unlockedDate");

    if (unlockedDate !== today && !location.pathname.includes("dashboard")) {
      navigate({ to: "/dashboard" });
    }
  }, [navigate, location]);

  return <>{children}</>;
}
