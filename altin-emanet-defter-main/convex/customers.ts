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
    // Use clerkId to find user instead of auth.getUserIdentity
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user || !user.shopId) {
      throw new Error("Giriş yapılmadı veya dükkan bilgisi bulunamadı");
    }

    const customerId = await ctx.db.insert("customers", {
      shopId: user.shopId,
      name: args.name,
      phone: args.phone,
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
  },
});

// Müşteri silme (sadece owner ve manager)
export const deleteCustomer = mutation({
  args: {
    customerId: v.id("customers"),
  },
  handler: async (ctx, args) => {
    const activeUser = await getActiveUser(ctx);
    if (!activeUser) {
      throw new Error("Giriş yapılmadı.");
    }

    if (activeUser.role === "staff") {
      throw new Error("Müşteri silme yetkiniz yoktur (Sadece yönetici ve dükkan sahipleri silebilir).");
    }

    const customer = await ctx.db.get(args.customerId);
    if (!customer || customer.shopId !== activeUser.shopId) {
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

    await ctx.db.delete(args.customerId);
  },
});
