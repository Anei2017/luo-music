import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    bio: v.optional(v.string()),
    avatarStorageId: v.optional(v.id("_storage")),
    provider: v.optional(v.string()),
    isOnline: v.optional(v.boolean()),
    lastSeen: v.optional(v.number()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("by_name", ["name"])
    .searchIndex("search_name", {
      searchField: "name",
    }),

  songs: defineTable({
    title: v.string(),
    artist: v.string(),
    category: v.string(),
    posterUrl: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
    audioStorageId: v.optional(v.id("_storage")),
    posterStorageId: v.optional(v.id("_storage")),
    duration: v.string(),
    uploadedBy: v.optional(v.id("users")),
    plays: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_uploadedBy", ["uploadedBy"]),

  comments: defineTable({
    text: v.string(),
    userId: v.id("users"),
    songId: v.id("songs"),
    parentId: v.optional(v.id("comments")),
    likeCount: v.number(),
  }).index("by_song", ["songId"])
    .index("by_user", ["userId"])
    .index("by_parent", ["parentId"]),

  likes: defineTable({
    userId: v.id("users"),
    targetId: v.string(),
    targetType: v.union(v.literal("song"), v.literal("comment")),
  }).index("by_user_target", ["userId", "targetId"])
    .index("by_target", ["targetId"]),

  conversations: defineTable({
    participants: v.array(v.id("users")),
    lastMessage: v.optional(v.string()),
    lastMessageTime: v.optional(v.number()),
  }).index("by_participants", ["participants"]),

  messages: defineTable({
    text: v.string(),
    userId: v.id("users"),
    conversationId: v.id("conversations"),
    imageStorageId: v.optional(v.id("_storage")),
  }).index("by_conversation", ["conversationId"])
    .index("by_user", ["userId"]),

  follows: defineTable({
    followerId: v.id("users"),
    followingId: v.id("users"),
  }).index("by_follower", ["followerId"])
    .index("by_following", ["followingId"])
    .index("unique", ["followerId", "followingId"]),
});
