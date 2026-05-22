import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listBySong = query({
  args: { songId: v.id("songs") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_song", (q) => q.eq("songId", args.songId))
      .take(500);
    const results = [];
    for (const comment of comments) {
      const user = await ctx.db.get(comment.userId);
      const avatarUrl = user?.avatarStorageId
        ? await ctx.storage.getUrl(user.avatarStorageId)
        : null;
      const userId = await getAuthUserId(ctx);
      const existingLike = userId
        ? await ctx.db
            .query("likes")
            .withIndex("by_user_target", (q) =>
              q.eq("userId", userId).eq("targetId", comment._id)
            )
            .first()
        : null;
      results.push({
        ...comment,
        userName: user?.name ?? "Unknown",
        userAvatar: avatarUrl,
        isLiked: !!existingLike,
        isOwner: userId === comment.userId,
      });
    }
    return results;
  },
});

export const add = mutation({
  args: {
    songId: v.id("songs"),
    text: v.string(),
    parentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("comments", {
      text: args.text,
      userId,
      songId: args.songId,
      parentId: args.parentId,
      likeCount: 0,
    });
  },
});

export const remove = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const comment = await ctx.db.get(args.commentId);
    if (!comment || comment.userId !== userId) throw new Error("Unauthorized");
    await ctx.db.delete(args.commentId);
  },
});
