import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const toggle = mutation({
  args: {
    targetId: v.string(),
    targetType: v.union(v.literal("song"), v.literal("comment")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("likes")
      .withIndex("by_user_target", (q) =>
        q.eq("userId", userId).eq("targetId", args.targetId)
      )
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
      if (args.targetType === "comment") {
        const comment = await ctx.db.get(args.targetId as any) as any;
        if (comment && "likeCount" in comment) {
          await ctx.db.patch(args.targetId as any, {
            likeCount: Math.max(0, comment.likeCount - 1),
          });
        }
      }
      return false;
    } else {
      await ctx.db.insert("likes", {
        userId,
        targetId: args.targetId,
        targetType: args.targetType,
      });
      if (args.targetType === "comment") {
        const comment = await ctx.db.get(args.targetId as any) as any;
        if (comment && "likeCount" in comment) {
          await ctx.db.patch(args.targetId as any, {
            likeCount: comment.likeCount + 1,
          });
        }
      }
      return true;
    }
  },
});

export const isLiked = query({
  args: { targetId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;
    const like = await ctx.db
      .query("likes")
      .withIndex("by_user_target", (q) =>
        q.eq("userId", userId).eq("targetId", args.targetId)
      )
      .first();
    return !!like;
  },
});

export const countByTarget = query({
  args: { targetId: v.string() },
  handler: async (ctx, args) => {
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_target", (q) => q.eq("targetId", args.targetId))
      .take(1000);
    return likes.length;
  },
});
