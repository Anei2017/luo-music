import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let songs;
    if (args.category && args.category !== "all") {
      songs = await ctx.db
        .query("songs")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .take(200);
    } else {
      songs = await ctx.db.query("songs").take(200);
    }
    const results = [];
    for (const song of songs) {
      const audioUrl = song.audioStorageId
        ? await ctx.storage.getUrl(song.audioStorageId)
        : song.audioUrl ?? null;
      const posterUrl = song.posterStorageId
        ? await ctx.storage.getUrl(song.posterStorageId)
        : song.posterUrl ?? null;
      const uploader = song.uploadedBy ? await ctx.db.get(song.uploadedBy) : null;
      const commentCount = await ctx.db
        .query("comments")
        .withIndex("by_song", (q) => q.eq("songId", song._id))
        .take(500)
        .then((c) => c.length);
      results.push({
        ...song,
        audioUrl,
        posterUrl,
        uploaderName: uploader?.name ?? "Unknown",
        commentCount,
      });
    }
    return results;
  },
});

export const get = query({
  args: { songId: v.id("songs") },
  handler: async (ctx, args) => {
    const song = await ctx.db.get(args.songId);
    if (!song) return null;
    const audioUrl = song.audioStorageId
      ? await ctx.storage.getUrl(song.audioStorageId)
      : song.audioUrl ?? null;
    const posterUrl = song.posterStorageId
      ? await ctx.storage.getUrl(song.posterStorageId)
      : song.posterUrl ?? null;
    const uploader = song.uploadedBy ? await ctx.db.get(song.uploadedBy) : null;
    return { ...song, audioUrl, posterUrl, uploaderName: uploader?.name ?? "Unknown" };
  },
});

export const upload = mutation({
  args: {
    title: v.string(),
    artist: v.string(),
    category: v.string(),
    duration: v.string(),
    audioStorageId: v.optional(v.id("_storage")),
    posterStorageId: v.optional(v.id("_storage")),
    posterUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("songs", {
      title: args.title,
      artist: args.artist,
      category: args.category,
      duration: args.duration,
      audioStorageId: args.audioStorageId,
      posterStorageId: args.posterStorageId,
      posterUrl: args.posterUrl,
      uploadedBy: userId,
      plays: 0,
    });
  },
});

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const songs = await ctx.db
      .query("songs")
      .withIndex("by_uploadedBy", (q) => q.eq("uploadedBy", args.userId))
      .take(200);
    const results = [];
    for (const song of songs) {
      const audioUrl = song.audioStorageId
        ? await ctx.storage.getUrl(song.audioStorageId)
        : song.audioUrl ?? null;
      const posterUrl = song.posterStorageId
        ? await ctx.storage.getUrl(song.posterStorageId)
        : song.posterUrl ?? null;
      results.push({ ...song, audioUrl, posterUrl });
    }
    return results;
  },
});

export const incrementPlays = mutation({
  args: { songId: v.id("songs") },
  handler: async (ctx, args) => {
    const song = await ctx.db.get(args.songId);
    if (!song) return;
    await ctx.db.patch(args.songId, { plays: song.plays + 1 });
  },
});

const SEED_TRACKS: Array<{
  title: string;
  artist: string;
  category: string;
  audioUrl: string;
  posterUrl: string;
  duration: string;
}> = [
  { title: "Track 1", artist: "Luo Artist", category: "luo", audioUrl: "/audio/1.mp3", posterUrl: "/img/1.jpg", duration: "3:54" },
  { title: "Track 2", artist: "Luo Artist", category: "luo", audioUrl: "/audio/2.mp3", posterUrl: "/img/2.jpg", duration: "3:58" },
  { title: "Track 3", artist: "Luo Artist", category: "luo", audioUrl: "/audio/3.mp3", posterUrl: "/img/3.jpg", duration: "3:03" },
  { title: "Track 4", artist: "Luo Artist", category: "luo", audioUrl: "/audio/4.mp3", posterUrl: "/img/4.jpg", duration: "5:00" },
  { title: "Track 5", artist: "Luo Artist", category: "luo", audioUrl: "/audio/5.mp3", posterUrl: "/img/5.jpg", duration: "3:21" },
  { title: "Track 6", artist: "Luo Artist", category: "luo", audioUrl: "/audio/6.mp3", posterUrl: "/img/6.jpg", duration: "4:11" },
  { title: "Track 7", artist: "Luo Artist", category: "luo", audioUrl: "/audio/7.mp3", posterUrl: "/img/7.jpg", duration: "5:09" },
  { title: "Track 8", artist: "Luo Artist", category: "luo", audioUrl: "/audio/8.mp3", posterUrl: "/img/8.jpg", duration: "3:18" },
  { title: "Track 9", artist: "Luo Artist", category: "luo", audioUrl: "/audio/9.mp3", posterUrl: "/img/9.jpg", duration: "2:05" },
  { title: "Track 10", artist: "Luo Artist", category: "luo", audioUrl: "/audio/10.mp3", posterUrl: "/img/10.jpg", duration: "2:31" },
  { title: "Track 11", artist: "Bollywood", category: "bollywood", audioUrl: "/audio/11.mp3", posterUrl: "/img/11.jpg", duration: "6:05" },
  { title: "Track 12", artist: "Bollywood", category: "bollywood", audioUrl: "/audio/12.mp3", posterUrl: "/img/12.jpg", duration: "4:37" },
  { title: "Track 13", artist: "Bollywood", category: "bollywood", audioUrl: "/audio/13.mp3", posterUrl: "/img/13.jpg", duration: "7:01" },
  { title: "Track 14", artist: "Bollywood", category: "bollywood", audioUrl: "/audio/14.mp3", posterUrl: "/img/14.jpg", duration: "5:31" },
  { title: "Track 15", artist: "Bollywood", category: "bollywood", audioUrl: "/audio/15.mp3", posterUrl: "/img/15.jpg", duration: "7:02" },
  { title: "Track 16", artist: "Bollywood", category: "bollywood", audioUrl: "/audio/16.mp3", posterUrl: "/img/16.jpg", duration: "2:27" },
  { title: "Track 17", artist: "Bollywood", category: "bollywood", audioUrl: "/audio/17.mp3", posterUrl: "/img/17.jpg", duration: "5:20" },
  { title: "Track 18", artist: "Bollywood", category: "bollywood", audioUrl: "/audio/18.mp3", posterUrl: "/img/18.jpg", duration: "8:05" },
  { title: "Track 19", artist: "Bollywood", category: "bollywood", audioUrl: "/audio/19.mp3", posterUrl: "/img/19.jpg", duration: "6:42" },
];

export const seedCatalog = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("songs").take(1);
    if (existing.length > 0) {
      return { seeded: 0, message: "Catalog already has songs" };
    }
    let inserted = 0;
    for (const track of SEED_TRACKS) {
      await ctx.db.insert("songs", {
        title: track.title,
        artist: track.artist,
        category: track.category,
        audioUrl: track.audioUrl,
        posterUrl: track.posterUrl,
        duration: track.duration,
        plays: 0,
      });
      inserted += 1;
    }
    return { seeded: inserted, message: `Seeded ${inserted} tracks` };
  },
});
