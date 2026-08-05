import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getActiveUser } from "./users";

// Müşteri oluşturma
export const createCustomer = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
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

    const customerId = await ctx.db.insert("customers", {
      shopId: user.shopId,
      name: args.name,
      phone: args.phone,
      createdAt: Date.now(),
    });

    // Log kaydı oluştur
    await ctx.db.insert("logs", {
      shopId: user.shopId,
      userId: user._id,
      action: "customer_created",
      entityType: "customer",
      entityId: customerId as any,
      details: JSON.stringify({
        customerName: args.name,
        customerPhone: args.phone,
      }),
      createdAt: Date.now(),
    });

    return customerId;
  },
});

// Dükkan müşterilerini getirme
export const getShopCustomers = query({
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

    const customers = await ctx.db
      .query("customers")
      .withIndex("by_shop", (q) => q.eq("shopId", user.shopId!))
      .collect();
    return customers;
  },
});

// Müşteri arama
export const searchCustomers = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const activeUser = await getActiveUser(ctx);
    if (!activeUser || !activeUser.shopId) {
      return [];
    }

    const customers = await ctx.db
      .query("customers")
      .withIndex("by_shop", (q) => q.eq("shopId", activeUser.shopId!))
      .collect();
    
    const searchTerm = args.searchTerm.toLowerCase();
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.phone.includes(searchTerm)
    );
  },
});

// Müşteri ID'sine göre getirme
export const getCustomerById = query({
  args: {
    customerId: v.id("customers"),
  },
  handler: async (ctx, args) => {
    const activeUser = await getActiveUser(ctx);
    if (!activeUser) {
      throw new Error("Müşteri sorgulamak için giriş yapmalısınız.");
    }

    const customer = await ctx.db.get(args.customerId);
    if (!customer || customer.shopId !== activeUser.shopId) {
      throw new Error("Müşteri bulunamadı veya yetkisiz erişim.");
    }

    return customer;
  },
});

// Müşteri güncelleme
export const updateCustomer = mutation({
  args: {
    customerId: v.id("customers"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    profileImage: v.optional(v.string()),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Use clerkId to find user instead of getActiveUser
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("Yetkisiz işlem.");
    }

    const customer = await ctx.db.get(args.customerId);
    if (!customer || customer.shopId !== user.shopId) {
      throw new Error("Müşteri bulunamadı veya yetkisiz erişim.");
    }

    const { customerId, clerkId, ...updates } = args;
    await ctx.db.patch(customerId, updates);

    // Log kaydı oluştur
    await ctx.db.insert("logs", {
      shopId: user.shopId!,
      userId: user._id,
      action: "customer_updated",
      entityType: "customer",
      entityId: customerId as any,
      details: JSON.stringify({
        customerName: customer.name,
        updates: updates,
      }),
      createdAt: Date.now(),
    });
  },
});

// Müşteri ve işlem verilerini CSV formatında getirme
export const exportShopDataCSV = query({
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

    const customers = await ctx.db
      .query("customers")
      .withIndex("by_shop", (q) => q.eq("shopId", user.shopId!))
      .collect();

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_shop", (q) => q.eq("shopId", user.shopId!))
      .collect();

    // Generate CSV with customer and transaction data
    const headers = "Türü,Müşteri ID,Müşteri Adı,Telefon,İşlem ID,İşlem Tipi,Metal Tipi,Tutar,Not,Vade Tarihi,Oluşturma Tarihi\n";

    const rows = customers.map(customer => {
      const customerTransactions = transactions.filter(t => t.customerId === customer._id);

      if (customerTransactions.length === 0) {
        // Customer with no transactions
        return `Müşteri,${customer._id},"${customer.name}","${customer.phone}",,,,,,,"${new Date(customer.createdAt).toLocaleString("tr-TR")}"`;
      }

      // Customer with transactions
      return customerTransactions.map(tx => {
        const date = new Date(tx.createdAt).toLocaleString("tr-TR");
        const dueDate = tx.dueDate ? new Date(tx.dueDate).toLocaleString("tr-TR") : "";
        const note = (tx.note || "").replace(/,/g, ";");
        return `İşlem,${customer._id},"${customer.name}","${customer.phone}",${tx._id},${tx.type},${tx.metalType},${tx.amount},"${note}","${dueDate}","${date}"`;
      }).join("\n");
    }).join("\n");

    return headers + rows;
  },
});

// Müşteri silme (sadece owner ve manager)
export const deleteCustomer = mutation({
  args: {
    customerId: v.id("customers"),
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

    if (user.role === "staff") {
      throw new Error("Müşteri silme yetkiniz yoktur (Sadece yönetici ve dükkan sahipleri silebilir).");
    }

    const customer = await ctx.db.get(args.customerId);
    if (!customer || customer.shopId !== user.shopId) {
      throw new Error("Müşteri bulunamadı veya yetkisiz erişim.");
    }

    // Müşterinin tüm işlemlerini sil
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .collect();

    for (const transaction of transactions) {
      await ctx.db.delete(transaction._id);
    }

    // Log kaydı oluştur
    await ctx.db.insert("logs", {
      shopId: user.shopId!,
      userId: user._id,
      action: "customer_deleted",
      entityType: "customer",
      entityId: args.customerId as any,
      details: JSON.stringify({
        customerName: customer.name,
        customerPhone: customer.phone,
        deletedTransactionsCount: transactions.length,
      }),
      createdAt: Date.now(),
    });

    await ctx.db.delete(args.customerId);
  },
});
