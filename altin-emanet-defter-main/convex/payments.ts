import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getPaymentsByTransaction = query({
  args: { transactionId: v.id("transactions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .filter((q) => q.eq(q.field("transactionId"), args.transactionId))
      .order("desc")
      .collect();
  },
});

export const addPayment = mutation({
  args: {
    transactionId: v.id("transactions"),
    amount: v.number(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction) throw new Error("Kayıt bulunamadı");
    if (args.amount <= 0) throw new Error("Tutar 0'dan büyük olmalı");

    await ctx.db.insert("payments", {
      transactionId: args.transactionId,
      amount: args.amount,
      paidAt: Date.now(),
      note: args.note,
    });

    const newAmount = Math.max(0, transaction.amount - args.amount);
    const isCompleted = newAmount === 0;

    await ctx.db.patch(args.transactionId, {
      amount: newAmount,
      isCompleted,
    });
  },
});

export const getPaymentsByCustomer = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    const txs = await ctx.db
      .query("transactions")
      .filter((q) => q.eq(q.field("customerId"), args.customerId))
      .collect();
    
    const paymentsList = [];
    for (const tx of txs) {
      const pmts = await ctx.db
        .query("payments")
        .filter((q) => q.eq(q.field("transactionId"), tx._id))
        .collect();
      paymentsList.push(...pmts);
    }
    return paymentsList;
  },
});
