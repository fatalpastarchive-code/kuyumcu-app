import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getActiveUser } from "./users";

// İşlem oluşturma
export const createTransaction = mutation({
  args: {
    customerId: v.id("customers"),
    type: v.string(), // "debt" (borç/emanet), "payment" (tahsilat/ödeme)
    metalType: v.string(), // "TL", "gram_22k", "gram_24k", "quarter"
    amount: v.number(),
    tlEquivalent: v.optional(v.number()),
    note: v.optional(v.string()),
    dueDate: v.optional(v.number()), // Vade tarihi (timestamp)
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Use clerkId to find user, create default user/shop if not exists
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .first();

    // Create default user and shop if not exists
    if (!user) {
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: "demo@example.com",
        name: "Demo Kullanıcı",
        role: "owner",
        status: "active",
        createdAt: Date.now(),
      });

      const shopId = await ctx.db.insert("shops", {
        name: "Demo Dükkan",
        ownerId: userId,
        smsTemplate: "Sayın [Müşteri Adı], Altın Defter sistemindeki vadeli [Borç Miktarı] borcunuzun ödeme günü gelmiştir. Hayırlı işler dileriz.",
        createdAt: Date.now(),
      });

      await ctx.db.patch(userId, { shopId });
      user = await ctx.db.get(userId);
    }

    // Create shop if user doesn't have one
    // @ts-ignore
    if (!user) {
      throw new Error("Kullanıcı bilgisi bulunamadı");
    }

    // Use non-null assertion after explicit check
    const safeUser = user;
    if (!safeUser.shopId) {
      const shopId = await ctx.db.insert("shops", {
        name: "Demo Dükkan",
        ownerId: safeUser._id,
        smsTemplate: "Sayın [Müşteri Adı], Altın Defter sistemindeki vadeli [Borç Miktarı] borcunuzun ödeme günü gelmiştir. Hayırlı işler dileriz.",
        createdAt: Date.now(),
      });

      await ctx.db.patch(safeUser._id, { shopId });
      const updatedUser = await ctx.db.get(safeUser._id);
      if (updatedUser) {
        user = updatedUser;
      }
    }

    if (!user || !user.shopId) {
      throw new Error("Kullanıcı veya dükkan bilgisi oluşturulamadı");
    }

    // Müşterinin bu dükkana ait olduğundan emin ol
    const customer = await ctx.db.get(args.customerId);
    if (!customer || customer.shopId !== user.shopId) {
      throw new Error("Müşteri bulunamadı veya yetkisiz erişim.");
    }

    const transactionId = await ctx.db.insert("transactions", {
      shopId: user.shopId,
      customerId: args.customerId,
      type: args.type,
      metalType: args.metalType,
      amount: args.amount,
      tlEquivalent: args.tlEquivalent,
      note: args.note,
      dueDate: args.dueDate,
      createdBy: user._id,
      isNotified: false,
      isCompleted: args.type === "payment" ? true : false,
      createdAt: Date.now(),
    });

    // Log kaydı oluştur
    await ctx.db.insert("logs", {
      shopId: user.shopId,
      userId: user._id,
      action: "transaction_created",
      entityType: "transaction",
      entityId: transactionId as any,
      details: JSON.stringify({
        customerId: args.customerId,
        type: args.type,
        metalType: args.metalType,
        amount: args.amount,
        note: args.note,
        dueDate: args.dueDate,
      }),
      createdAt: Date.now(),
    });

    return transactionId;
  },
});

// Müşteri işlemlerini getirme
export const getCustomerTransactions = query({
  args: {
    customerId: v.id("customers"),
  },
  handler: async (ctx, args) => {
    const activeUser = await getActiveUser(ctx);
    if (!activeUser) {
      return [];
    }

    // Yetki kontrolü
    const customer = await ctx.db.get(args.customerId);
    if (!customer || customer.shopId !== activeUser.shopId) {
      throw new Error("Yetkisiz erişim.");
    }

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .order("desc")
      .collect();
    return transactions;
  },
});

// Dükkan işlemlerini getirme
export const getShopTransactions = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Use clerkId to find user instead of getActiveUser
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user || !user.shopId) {
      return [];
    }

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_shop", (q) => q.eq("shopId", user.shopId!))
      .order("desc")
      .collect();
    return transactions;
  },
});

// İşlem silme
export const deleteTransaction = mutation({
  args: {
    transactionId: v.id("transactions"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Use clerkId to find user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("Giriş yapılmadı.");
    }

    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction || transaction.shopId !== user.shopId) {
      throw new Error("İşlem bulunamadı veya yetkisiz erişim.");
    }

    // Log kaydı oluştur
    await ctx.db.insert("logs", {
      shopId: user.shopId!,
      userId: user._id,
      action: "transaction_deleted",
      entityType: "transaction",
      entityId: args.transactionId as any,
      details: JSON.stringify({
        customerId: transaction.customerId,
        type: transaction.type,
        metalType: transaction.metalType,
        amount: transaction.amount,
        note: transaction.note,
      }),
      createdAt: Date.now(),
    });

    // İşlemi sil
    await ctx.db.delete(args.transactionId);
  },
});

// Vadesi bugün gelen veya vadesi geçmiş tamamlanmamış işlemleri getirme (Anlık Bildirimler İçin)
export const getActiveDueTransactions = query({
  args: {
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const clerkId = args.clerkId || "demo-user";
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user || !user.shopId) return [];

    const today = Date.now();

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_shop", (q) => q.eq("shopId", user.shopId!))
      .collect();

    const filtered = transactions.filter(
      (t) =>
        t.type === "debt" &&
        t.dueDate !== undefined &&
        t.dueDate <= today &&
        t.isCompleted !== true
    );

    const result = [];
    for (const t of filtered) {
      const customer = await ctx.db.get(t.customerId);
      result.push({
        ...t,
        customerName: customer ? customer.name : "Bilinmeyen Müşteri",
        customerPhone: customer ? customer.phone : "",
      });
    }
    return result;
  },
});

// Yaklaşan vadeli işlemleri getirme (Gelecek X gün için)
export const getUpcomingDueTransactions = query({
  args: {
    daysAhead: v.number(),
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const clerkId = args.clerkId || "demo-user";
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user || !user.shopId) return [];

    const now = Date.now();
    const futureDate = now + args.daysAhead * 24 * 60 * 60 * 1000;

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_shop", (q) => q.eq("shopId", user.shopId!))
      .collect();

    const filtered = transactions.filter(
      (t) =>
        t.type === "debt" &&
        t.dueDate !== undefined &&
        t.dueDate > now &&
        t.dueDate <= futureDate &&
        t.isCompleted !== true
    );

    const result = [];
    for (const t of filtered) {
      const customer = await ctx.db.get(t.customerId);
      result.push({
        ...t,
        customerName: customer ? customer.name : "Bilinmeyen Müşteri",
        customerPhone: customer ? customer.phone : "",
      });
    }
    return result;
  },
});

// Bugün vadesi gelen işlemleri getirme
export const getTodayDueTransactions = query({
  args: {},
  handler: async (ctx) => {
    const activeUser = await getActiveUser(ctx);
    if (!activeUser || !activeUser.shopId) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000;

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_shop", (q) => q.eq("shopId", activeUser.shopId!))
      .collect();

    const filtered = transactions.filter(
      (t) =>
        t.type === "debt" &&
        t.dueDate !== undefined &&
        t.dueDate >= todayStart &&
        t.dueDate < todayEnd &&
        t.isCompleted !== true
    );

    const result = [];
    for (const t of filtered) {
      const customer = await ctx.db.get(t.customerId);
      result.push({
        ...t,
        customerName: customer ? customer.name : "Bilinmeyen Müşteri",
        customerPhone: customer ? customer.phone : "",
      });
    }
    return result;
  },
});

// İşlemi tamamlandı (ödendi) olarak işaretleme veya güncelleme
export const updateTransaction = mutation({
  args: {
    transactionId: v.id("transactions"),
    isNotified: v.optional(v.boolean()),
    isCompleted: v.optional(v.boolean()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const activeUser = await getActiveUser(ctx);
    if (!activeUser) {
      throw new Error("Giriş yapılmadı.");
    }

    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction || transaction.shopId !== activeUser.shopId) {
      throw new Error("İşlem bulunamadı veya yetkisiz erişim.");
    }

    const { transactionId, ...updates } = args;
    await ctx.db.patch(transactionId, updates);
  },
});

// Günlük toplam tahsilat (Bugün tahsil edilen TL karşılığı)
export const getTodayCollection = query({
  args: {},
  handler: async (ctx) => {
    const activeUser = await getActiveUser(ctx);
    if (!activeUser || !activeUser.shopId) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_shop", (q) => q.eq("shopId", activeUser.shopId!))
      .collect();

    const todayPayments = transactions.filter(
      (t) => t.type === "payment" && t.createdAt >= todayStart
    );

    return todayPayments.reduce((sum, t) => sum + (t.tlEquivalent || t.amount), 0);
  },
});
