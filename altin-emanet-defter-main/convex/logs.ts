import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getActiveUser } from "./users";

// Log kaydı oluşturma
export const createLog = mutation({
  args: {
    action: v.string(),
    entityType: v.string(),
    entityId: v.optional(v.string()),
    details: v.optional(v.string()),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Use clerkId to find user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user || !user.shopId) {
      throw new Error("Yetkisiz işlem.");
    }

    await ctx.db.insert("logs", {
      shopId: user.shopId,
      userId: user._id,
      action: args.action,
      entityType: args.entityType,
      entityId: args.entityId as any,
      details: args.details,
      createdAt: Date.now(),
    });
  },
});

// Dükkan loglarını getirme
export const getShopLogs = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Use clerkId to find user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user || !user.shopId) {
      return [];
    }

    const logs = await ctx.db
      .query("logs")
      .withIndex("by_shop", (q) => q.eq("shopId", user.shopId!))
      .order("desc")
      .take(100);

    // Fetch user names for logs
    const logsWithUsers = await Promise.all(
      logs.map(async (log) => {
        const logUser = await ctx.db.get(log.userId);
        return {
          ...log,
          userName: logUser?.name || "Bilinmeyen",
        };
      })
    );

    return logsWithUsers;
  },
});

// Logları CSV formatında getirme
export const getShopLogsCSV = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Use clerkId to find user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user || !user.shopId) {
      return "";
    }

    const logs = await ctx.db
      .query("logs")
      .withIndex("by_shop", (q) => q.eq("shopId", user.shopId!))
      .order("desc")
      .collect();

    // Fetch user names for logs
    const logsWithUsers = await Promise.all(
      logs.map(async (log) => {
        const logUser = await ctx.db.get(log.userId);
        return {
          ...log,
          userName: logUser?.name || "Bilinmeyen",
        };
      })
    );

    // Generate CSV
    const headers = "Tarih,İşlem,Varlık Türü,Varlık ID,Detaylar,Kullanıcı\n";
    const rows = logsWithUsers.map(log => {
      const date = new Date(log.createdAt).toLocaleString("tr-TR");
      const action = log.action;
      const entityType = log.entityType;
      const entityId = log.entityId || "";
      const details = (log.details || "").replace(/,/g, ";");
      const userName = log.userName;
      return `${date},${action},${entityType},${entityId},${details},${userName}`;
    }).join("\n");

    return headers + rows;
  },
});
