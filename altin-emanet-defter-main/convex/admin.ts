import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
// @ts-ignore
import { getActiveUser } from "./users";

// Bulk import data from Excel backup
export const bulkImportData = mutation({
  args: {
    customers: v.array(v.object({
      name: v.string(),
      phone: v.string(),
    })),
    transactions: v.array(v.object({
      customerPhone: v.string(),
      type: v.string(),
      metalType: v.string(),
      amount: v.number(),
      note: v.optional(v.string()),
      dueDate: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const activeUser = await getActiveUser(ctx);
    if (!activeUser) {
      throw new Error("Giriş yapılmadı.");
    }

    if (activeUser.role !== "owner") {
      throw new Error("Veri içe aktarma sadece dükkan sahibi tarafından yapılabilir.");
    }

    const shopId = activeUser.shopId;
    if (!shopId) {
      throw new Error("Dükkan bilgisi bulunamadı");
    }

    // Create customers and map phone to ID
    const phoneToCustomerId = new Map<string, any>();
    
    for (const customerData of args.customers) {
      // Check if customer already exists
      const existing = await ctx.db
        .query("customers")
        .withIndex("by_phone", (q) => q.eq("shopId", shopId).eq("phone", customerData.phone))
        .first();

      if (!existing) {
        const customerId = await ctx.db.insert("customers", {
          shopId,
          name: customerData.name,
          phone: customerData.phone,
          createdAt: Date.now(),
        });
        phoneToCustomerId.set(customerData.phone, customerId);
      } else {
        phoneToCustomerId.set(customerData.phone, existing._id);
      }
    }

    // Create transactions
    for (const txData of args.transactions) {
      const customerId = phoneToCustomerId.get(txData.customerPhone);
      if (!customerId) {
        console.warn(`Customer not found for phone: ${txData.customerPhone}`);
        continue;
      }

      await ctx.db.insert("transactions", {
        shopId,
        customerId,
        type: txData.type,
        metalType: txData.metalType,
        amount: txData.amount,
        note: txData.note,
        dueDate: txData.dueDate,
        createdBy: activeUser._id,
        isNotified: false,
        isCompleted: txData.type === "payment",
        createdAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Get all shops (super-admin only)
export const getAllShops = query({
  args: {},
  handler: async (ctx) => {
    const shops = await ctx.db.query("shops").collect();
    return shops;
  },
});

// Get all users (super-admin only)
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users;
  },
});

// Create new shop (super-admin only)
export const createShopAdmin = mutation({
  args: {
    name: v.string(),
    ownerEmail: v.string(),
    ownerName: v.string(),
  },
  handler: async (ctx, args) => {
    // First create the user
    const userId = await ctx.db.insert("users", {
      clerkId: "admin-created-" + Date.now(),
      email: args.ownerEmail,
      name: args.ownerName,
      role: "owner",
      shopId: undefined, // Will be set after shop creation
      status: "active",
      createdAt: Date.now(),
    });

    // Then create the shop with the user ID
    const shopId = await ctx.db.insert("shops", {
      name: args.name,
      ownerId: userId,
      smsTemplate: "Sayın [Müşteri Adı], Altın Defter sistemindeki vadeli [Borç Miktarı] borcunuzun ödeme günü gelmiştir. Hayırlı işler dileriz.",
      createdAt: Date.now(),
    });

    // Update user with shop ID
    await ctx.db.patch(userId, {
      shopId: shopId,
    });

    return shopId;
  },
});

// Update user role and shop assignment (super-admin only)
export const updateUserAdmin = mutation({
  args: {
    userId: v.id("users"),
    role: v.string(),
    shopId: v.optional(v.id("shops")),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      role: args.role,
      shopId: args.shopId,
      ...(args.status && { status: args.status }),
    });
  },
});

// Delete shop (super-admin only)
export const deleteShopAdmin = mutation({
  args: {
    shopId: v.id("shops"),
  },
  handler: async (ctx, args) => {
    // Delete all users in this shop
    const users = await ctx.db
      .query("users")
      .filter((q: any) => q.eq(q.field("shopId"), args.shopId))
      .collect();
    
    for (const user of users) {
      await ctx.db.delete(user._id);
    }

    // Delete all customers in this shop
    const customers = await ctx.db
      .query("customers")
      .withIndex("by_shop", (q) => q.eq("shopId", args.shopId))
      .collect();
    
    for (const customer of customers) {
      // Delete all transactions for this customer
      const transactions = await ctx.db
        .query("transactions")
        .withIndex("by_customer", (q) => q.eq("customerId", customer._id))
        .collect();
      
      for (const transaction of transactions) {
        await ctx.db.delete(transaction._id);
      }
      
      await ctx.db.delete(customer._id);
    }

    // Delete the shop
    await ctx.db.delete(args.shopId);
  },
});

// Delete user (super-admin only)
export const deleteUserAdmin = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.userId);
  },
});

// Clear entire database (super-admin only)
export const clearEntireDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Delete all payments
    const payments = await ctx.db.query("payments").collect();
    for (const payment of payments) {
      await ctx.db.delete(payment._id);
    }

    // 2. Delete all transactions
    const transactions = await ctx.db.query("transactions").collect();
    for (const transaction of transactions) {
      await ctx.db.delete(transaction._id);
    }

    // 3. Delete all customers
    const customers = await ctx.db.query("customers").collect();
    for (const customer of customers) {
      await ctx.db.delete(customer._id);
    }

    // 4. Delete all users
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      await ctx.db.delete(user._id);
    }

    // 5. Delete all shops
    const shops = await ctx.db.query("shops").collect();
    for (const shop of shops) {
      await ctx.db.delete(shop._id);
    }

    // 6. Delete other settings tables if they have data
    const nSettings = await ctx.db.query("notificationSettings").collect();
    for (const ns of nSettings) {
      await ctx.db.delete(ns._id);
    }

    const units = await ctx.db.query("units").collect();
    for (const unit of units) {
      await ctx.db.delete(unit._id);
    }

    const settings = await ctx.db.query("settings").collect();
    for (const setting of settings) {
      await ctx.db.delete(setting._id);
    }

    return { success: true };
  },
});
