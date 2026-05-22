import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listConversations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const allConversations = await ctx.db.query("conversations").take(500);
    const myConversations = allConversations.filter((c) =>
      c.participants.includes(userId)
    );
    const results = [];
    for (const conv of myConversations) {
      const otherIds = conv.participants.filter((p) => p !== userId);
      const others = [];
      for (const oid of otherIds) {
        const user = await ctx.db.get(oid);
        if (user) {
          const avatarUrl = user.avatarStorageId
            ? await ctx.storage.getUrl(user.avatarStorageId)
            : null;
          others.push({ ...user, avatarUrl });
        }
      }
      results.push({ ...conv, others });
    }
    return results.sort(
      (a, b) => (b.lastMessageTime ?? 0) - (a.lastMessageTime ?? 0)
    );
  },
});

export const getOrCreateConversation = mutation({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const allConversations = await ctx.db.query("conversations").take(2000);
    const existing = allConversations.find(
      (c) =>
        c.participants.length === 2 &&
        c.participants.includes(userId) &&
        c.participants.includes(args.otherUserId)
    );
    if (existing) return existing._id;
    return await ctx.db.insert("conversations", {
      participants: [userId, args.otherUserId],
    });
  },
});

export const listMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .take(200);
    messages.reverse();
    const results = [];
    for (const msg of messages) {
      const user = await ctx.db.get(msg.userId);
      const avatarUrl = user?.avatarStorageId
        ? await ctx.storage.getUrl(user.avatarStorageId)
        : null;
      const imageUrl = msg.imageStorageId
        ? await ctx.storage.getUrl(msg.imageStorageId)
        : null;
      results.push({
        ...msg,
        userName: user?.name ?? "Unknown",
        userAvatar: avatarUrl,
        imageUrl,
      });
    }
    return results.sort((a, b) => a._creationTime - b._creationTime);
  },
});

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    text: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.insert("messages", {
      text: args.text,
      userId,
      conversationId: args.conversationId,
      imageStorageId: args.imageStorageId,
    });
    await ctx.db.patch(args.conversationId, {
      lastMessage: args.text,
      lastMessageTime: Date.now(),
    });
  },
});

export const globalChat = query({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db.query("messages").order("desc").take(100);
    messages.reverse();
    const results = [];
    for (const msg of messages) {
      const user = await ctx.db.get(msg.userId);
      const avatarUrl = user?.avatarStorageId
        ? await ctx.storage.getUrl(user.avatarStorageId)
        : null;
      results.push({
        ...msg,
        userName: user?.name ?? "Unknown",
        userAvatar: avatarUrl,
      });
    }
    return results.sort((a, b) => a._creationTime - b._creationTime);
  },
});

export const sendGlobalMessage = mutation({
  args: {
    text: v.string(),
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.insert("messages", {
      text: args.text,
      userId,
      conversationId: args.conversationId,
    });
    await ctx.db.patch(args.conversationId, {
      lastMessage: args.text,
      lastMessageTime: Date.now(),
    });
  },
});
