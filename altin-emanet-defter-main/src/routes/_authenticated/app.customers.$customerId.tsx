import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/app/customers/$customerId")({
  beforeLoad: async () => {
    throw redirect({ to: "/dashboard" });
  },
  component: () => null,
});
