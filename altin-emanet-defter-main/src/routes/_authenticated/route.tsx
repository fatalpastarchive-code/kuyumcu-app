import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const unlockedDate = localStorage.getItem("unlockedDate");
    const today = new Date().toISOString().split("T")[0];
    
    if (unlockedDate !== today) {
      throw redirect({ to: "/dashboard" });
    }
    return {};
  },
  component: () => <Outlet />,
});
