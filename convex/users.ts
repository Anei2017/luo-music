import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    const avatarUrl = user.avatarStorageId
      ? await ctx.storage.getUrl(user.avatarStorageId)
      : null;
    return { ...user, avatarUrl };
  },
});

export const ensureUser = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db.get(userId);
    if (existing) return existing._id;
    return await ctx.db.insert("users", {
      name: undefined,
      isOnline: true,
      lastSeen: Date.now(),
    });
  },
});

export const backfillNameFromEmail = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) return;
    if (user.name && user.name.trim().length > 0) return;
    const emailPrefix = user.email?.split("@")[0];
    if (emailPrefix && emailPrefix.length > 0) {
      await ctx.db.patch(userId, { name: emailPrefix });
    }
  },
});

export const get = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    const avatarUrl = user.avatarStorageId
      ? await ctx.storage.getUrl(user.avatarStorageId)
      : null;
    return { ...user, avatarUrl };
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.bio !== undefined) updates.bio = args.bio;
    if (args.avatarStorageId !== undefined) updates.avatarStorageId = args.avatarStorageId;
    await ctx.db.patch(userId, updates);
    return userId;
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

export const setOnline = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;
    await ctx.db.patch(userId, { isOnline: true, lastSeen: Date.now() });
  },
});

export const setOffline = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;
    await ctx.db.patch(userId, { isOnline: false, lastSeen: Date.now() });
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withSearchIndex("search_name", (q) => q.search("name", args.query))
      .take(20);
    const results = [];
    for (const user of users) {
      const avatarUrl = user.avatarStorageId
        ? await ctx.storage.getUrl(user.avatarStorageId)
        : null;
      results.push({ ...user, avatarUrl });
    }
    return results;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").take(50);
    const results = [];
    for (const user of users) {
      const avatarUrl = user.avatarStorageId
        ? await ctx.storage.getUrl(user.avatarStorageId)
        : null;
      results.push({ ...user, avatarUrl });
    }
    return results;
  },
});
