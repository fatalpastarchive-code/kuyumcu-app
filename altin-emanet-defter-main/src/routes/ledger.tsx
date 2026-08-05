import { createFileRoute } from "@tanstack/react-router";
import { Ledger } from "../components/ledger/Ledger";
import { BottomNavigation } from "../components/navigation/BottomNavigation";
import { useQuery } from "convex/react";
// @ts-ignore
import { api } from "@convex/_generated/api.js";

export const Route = createFileRoute("/ledger")({
  component: LedgerRoute,
});

function LedgerRoute() {
  const userId = "demo-user";
  const transactions = useQuery(api.transactions.getShopTransactions, { clerkId: userId });
  
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
      <Ledger />
      <BottomNavigation overdueCount={getOverdueCount()} />
    </>
  );
}
