import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
// @ts-ignore
import { getActiveUser } from "./users";

// Giriş yapmış kullanıcı için yeni dükkan oluşturur ve kullanıcının owner rolünü ayarlar
export const createShop = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Dükkan oluşturmak için giriş yapmalısınız.");
    }

    // Kullanıcının halihazirda bir dükkanı var mı?
    const existingUser = await getActiveUser(ctx);
    if (existingUser?.shopId) {
      throw new Error("Zaten kayıtlı olduğunuz bir dükkan bulunmaktadır.");
    }

    // 1. Dükkanı oluştur
    const shopId = await ctx.db.insert("shops", {
      name: args.name,
      ownerId: existingUser._id,
      smsTemplate: "Sayın [Müşteri Adı], Altın Defter sistemindeki vadeli [Borç Miktarı] borcunuzun ödeme günü gelmiştir. Hayırlı işler dileriz.",
      createdAt: Date.now(),
    });

    // 2. Kullanıcı zaten var mı? Patch yap, yoksa insert et
    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        role: "owner",
        shopId: shopId,
        status: "active",
      });
    } else {
      await ctx.db.insert("users", {
        clerkId: identity.subject,
        email: identity.email || "",
        name: identity.name || "",
        role: "owner",
        shopId: shopId,
        status: "active",
        createdAt: Date.now(),
      });
    }

    return shopId;
  },
});

// Dükkan ID'sine göre dükkan getirme
export const getShopById = query({
  args: {
    shopId: v.id("shops"),
  },
  handler: async (ctx, args) => {
    const activeUser = await getActiveUser(ctx);
    if (!activeUser || activeUser.shopId !== args.shopId) {
      throw new Error("Yetkisiz erişim.");
    }
    const shop = await ctx.db.get(args.shopId);
    return shop;
  },
});

// Dükkan SMS şablonunu güncelleme
export const updateShopSmsTemplate = mutation({
  args: {
    smsTemplate: v.string(),
  },
  handler: async (ctx, args) => {
    const activeUser = await getActiveUser(ctx);
    if (!activeUser) {
      throw new Error("Giriş yapılmadı.");
    }

    if (activeUser.role !== "owner") {
      throw new Error("SMS şablonunu sadece dükkan sahibi güncelleyebilir.");
    }

    if (!activeUser.shopId) {
      throw new Error("Dükkan bilgisi bulunamadı.");
    }

    await ctx.db.patch(activeUser.shopId, {
      smsTemplate: args.smsTemplate,
    });
  },
});
