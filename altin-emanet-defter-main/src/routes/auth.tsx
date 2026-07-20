import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Logo } from "@/components/landing/Logo";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();

  // Redirect to welcome page for PIN authentication
  navigate({ to: "/dashboard" });

  return null;
}
