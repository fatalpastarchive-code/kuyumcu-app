import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getNotificationSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("notificationSettings").first();
    if (!settings) {
      return {
        reminderDaysBefore: 1,
        overdueRepeatIntervalDays: 1,
      };
    }
    return settings;
  },
});

export const updateNotificationSettings = mutation({
  args: {
    reminderDaysBefore: v.number(),
    overdueRepeatIntervalDays: v.number(),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db.query("notificationSettings").first();
    if (settings) {
      await ctx.db.patch(settings._id, {
        reminderDaysBefore: args.reminderDaysBefore,
        overdueRepeatIntervalDays: args.overdueRepeatIntervalDays,
      });
    } else {
      await ctx.db.insert("notificationSettings", {
        reminderDaysBefore: args.reminderDaysBefore,
        overdueRepeatIntervalDays: args.overdueRepeatIntervalDays,
      });
    }
  },
});
