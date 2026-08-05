import { useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
// @ts-ignore
import { api } from "@convex/_generated/api.js";
import { useNotifications } from "../providers/NotificationProvider";

export function useNotificationChecker(clerkId: string = "demo-user") {
  const { settings, sendNotification, permission } = useNotifications();
  const transactions = useQuery(api.transactions.getShopTransactions, { clerkId });
  const updateTransaction = useMutation(api.transactions.updateTransaction);
  const processedTxIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!settings.enabled || permission !== "granted" || !transactions) {
      return;
    }

    const checkDueDates = () => {
      const now = Date.now();
      const advanceNoticeMs = (settings.advanceNotice || 0) * 24 * 60 * 60 * 1000;

      // Filter transactions that are debt, not completed, and not marked notified
      const dueTransactions = transactions.filter((tx: any) => {
        if (tx.type !== "debt" || !tx.dueDate || tx.isCompleted || tx.isNotified || processedTxIds.current.has(tx._id)) {
          return false;
        }

        const notificationTime = tx.dueDate - advanceNoticeMs;
        // Trigger if current time has reached or passed notification target time (within last 24h window)
        return now >= notificationTime && (now - notificationTime) < 24 * 60 * 60 * 1000;
      });

      if (dueTransactions.length === 0) {
        return;
      }

      dueTransactions.forEach(async (tx: any) => {
        processedTxIds.current.add(tx._id);

        const customerName = tx.customerName || "Müşteri";
        const amount = tx.amount;
        const metalType = tx.metalType;
        const dueDateFormatted = new Date(tx.dueDate).toLocaleDateString("tr-TR", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });

        // Send push notification
        sendNotification(
          `Vade Bildirimi - ${customerName}`,
          `${amount} ${metalType} borcunun vadesi ${dueDateFormatted} tarihinde doluyor.`
        );

        // Update database to mark as notified
        try {
          await updateTransaction({
            transactionId: tx._id,
            isNotified: true
          });
        } catch (err) {
          console.error("Failed to update transaction notification state:", err);
        }
      });
    };

    // Check every 10 seconds for timely execution
    const interval = setInterval(checkDueDates, 10000);

    // Initial immediate check
    checkDueDates();

    return () => clearInterval(interval);
  }, [settings, permission, transactions, sendNotification, updateTransaction]);
}

