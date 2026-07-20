import { createFileRoute } from "@tanstack/react-router";
import { Logs } from "../components/logs/Logs";
import { BottomNavigation } from "../components/navigation/BottomNavigation";
import { useQuery } from "convex/react";
// @ts-ignore
import { api } from "@convex/_generated/api.js";
import { useAuth } from "@clerk/clerk-react";

export const Route = createFileRoute("/logs")({
  component: LogsRoute,
});

function LogsRoute() {
  const { userId } = useAuth();
  const transactions = useQuery(api.transactions.getShopTransactions, userId ? { clerkId: userId } : "skip");

  const getOverdueCount = () => {
    const todayStart = new Date().setHours(0, 0, 0, 0);
    let count = 0;

    transactions?.forEach((tx: any) => {
      if (tx.type === "debt" && tx.dueDate && !tx.isCompleted && tx.dueDate < todayStart) {
        count++;
      }
    });

    return count;
  };

  return (
    <>
      <Logs />
      <BottomNavigation overdueCount={getOverdueCount()} />
    </>
  );
}
