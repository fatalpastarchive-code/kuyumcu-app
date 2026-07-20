import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Security helper - verify user is authenticated and has access to shop
export async function getAuthenticatedUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Giriş yapılmadı");
  }
  
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk", (q: any) => q.eq("clerkId", identity.subject))
    .first();
    
  if (!user) {
    throw new Error("Kullanıcı bulunamadı");
  }
  
  return user;
}

// Security helper - verify user has access to specific shop
export async function verifyShopAccess(ctx: any, shopId: any) {
  const user = await getAuthenticatedUser(ctx);
  
  if (user.shopId !== shopId) {
    throw new Error("Bu dükkana erişim yetkiniz yok");
  }
  
  return user;
}

// Backward compatibility - export as getActiveUser for existing code
export const getActiveUser = getAuthenticatedUser;

// Sync user from Clerk to Convex - called automatically on auth
export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { clerkId, email, name } = args;
    
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q: any) => q.eq("clerkId", clerkId))
      .first();

    if (existingUser) {
      let updatedUser = { ...existingUser };
      
      // If the existing user doesn't have a shop, create one and link it
      if (!existingUser.shopId) {
        const shopId = await ctx.db.insert("shops", {
          name: "Benim Dükkanım",
          ownerId: existingUser._id,
          smsTemplate: "Sayın [Müşteri Adı], Altın Defter sistemindeki vadeli [Borç Miktarı] borcunuzun ödeme günü gelmiştir. Hayırlı işler dileriz.",
          createdAt: Date.now(),
        });
        
        await ctx.db.patch(existingUser._id, {
          shopId: shopId,
          role: "owner",
          status: "active",
        });
        
        const freshUser = await ctx.db.get(existingUser._id);
        if (freshUser) updatedUser = freshUser;
      } else if (existingUser.email !== email || existingUser.name !== name) {
        await ctx.db.patch(existingUser._id, {
          email,
          name,
        });
        const freshUser = await ctx.db.get(existingUser._id);
        if (freshUser) updatedUser = freshUser;
      }
      return updatedUser;
    }

    // 1. Create the user first without a shopId
    const userId = await ctx.db.insert("users", {
      clerkId,
      email,
      name: name || "Değerli Kullanıcı",
      role: "owner",
      status: "active",
      createdAt: Date.now(),
    });

    // 2. Create the shop referencing the user's Id as ownerId
    const shopId = await ctx.db.insert("shops", {
      name: "Benim Dükkanım",
      ownerId: userId,
      smsTemplate: "Sayın [Müşteri Adı], Altın Defter sistemindeki vadeli [Borç Miktarı] borcunuzun ödeme günü gelmiştir. Hayırlı işler dileriz.",
      createdAt: Date.now(),
    });

    // 3. Update the user with the created shopId
    await ctx.db.patch(userId, {
      shopId: shopId,
    });

    return await ctx.db.get(userId);
  },
});

// Get current authenticated user
export const getMe = query({
  args: {},
  handler: async (ctx) => {
    try {
      return await getAuthenticatedUser(ctx);
    } catch (error) {
      return null;
    }
  },
});

// Onboard as owner - create shop and set user as owner
export const onboardOwner = mutation({
  args: {
    shopName: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const { shopName, clerkId } = args;
    
    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q: any) => q.eq("clerkId", clerkId))
      .first();
      
    if (!user) {
      throw new Error("Kullanıcı bulunamadı");
    }
    
    // Check if user already has a shop
    if (user.shopId) {
      const existingShop = await ctx.db.get(user.shopId);
      if (existingShop) {
        return { userId: user._id, shopId: user.shopId };
      }
    }
    
    // Create shop
    const shopId = await ctx.db.insert("shops", {
      name: shopName,
      ownerId: user._id,
      smsTemplate: "Sayın [Müşteri Adı], Altın Defter sistemindeki vadeli [Borç Miktarı] borcunuzun ödeme günü gelmiştir. Hayırlı işler dileriz.",
      createdAt: Date.now(),
    });

    // Update user as owner with shop
    await ctx.db.patch(user._id, {
      role: "owner",
      shopId: shopId,
      status: "active",
    });

    return { userId: user._id, shopId };
  },
});

// Onboard as staff - set user as pending staff
export const onboardStaff = mutation({
  args: {
    name: v.optional(v.string()),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const { name, clerkId } = args;
    
    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q: any) => q.eq("clerkId", clerkId))
      .first();
      
    if (!user) {
      throw new Error("Kullanıcı bulunamadı");
    }
    
    // Update user as pending staff
    await ctx.db.patch(user._id, {
      name: name || user.name,
      role: "staff",
      status: "pending",
    });

    return await ctx.db.get(user._id);
  },
});
