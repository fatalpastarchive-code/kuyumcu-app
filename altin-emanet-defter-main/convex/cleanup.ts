import { mutation } from "./_generated/server";

export const deleteOldShops = mutation({
  args: {},
  handler: async (ctx) => {
    const shops = await ctx.db.query("shops").collect();
    for (const shop of shops) {
      await ctx.db.delete(shop._id);
    }
    return { deleted: shops.length };
  },
});

export const deleteOldUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      await ctx.db.delete(user._id);
    }
    return { deleted: users.length };
  },
});
