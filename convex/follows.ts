import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const toggle = mutation({
  args: { followingId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    if (userId === args.followingId) throw new Error("Cannot follow yourself");
    const existing = await ctx.db
      .query("follows")
      .withIndex("unique", (q) =>
        q.eq("followerId", userId).eq("followingId", args.followingId)
      )
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
      return false;
    } else {
      await ctx.db.insert("follows", {
        followerId: userId,
        followingId: args.followingId,
      });
      return true;
    }
  },
});

export const isFollowing = query({
  args: { followingId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;
    const follow = await ctx.db
      .query("follows")
      .withIndex("unique", (q) =>
        q.eq("followerId", userId).eq("followingId", args.followingId)
      )
      .first();
    return !!follow;
  },
});

export const followers = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("followingId", args.userId))
      .take(1000);
    return follows.length;
  },
});

export const following = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .take(1000);
    return follows.length;
  },
});
