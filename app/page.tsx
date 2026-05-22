"use client";

import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useRef } from "react";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import TopNav from "@/components/TopNav";

export default function Home() {
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.current, isAuthenticated ? {} : "skip");
  const songs = useQuery(api.songs.list, {});
  const incrementPlays = useMutation(api.songs.incrementPlays);

  const [currentSong, setCurrentSong] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [searchQuery, setSearchQuery] = useState("");
  const [showComments, setShowComments] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<"all" | "luo" | "bollywood">("all");

  const audioRef = useRef<HTMLAudioElement>(null);

  if (authLoading || songs === undefined || (isAuthenticated && user === undefined)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-luo-black">
        <div className="w-10 h-10 border-4 border-luo-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <SignedOutHome songCount={songs.length} />;
  }

  const filteredSongs = songs
    .filter((s) =>
      activeCategory === "all" ? true : s.category === activeCategory
    )
    .filter((s) =>
      searchQuery
        ? s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.artist.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

  const playSong = (song: any) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setTimeout(() => audioRef.current?.play(), 100);
  };

  const togglePlay = () => {
    if (!currentSong && songs.length) {
      playSong(songs[0]);
      return;
    }
    if (isPlaying) audioRef.current?.pause();
    else audioRef.current?.play();
    setIsPlaying(!isPlaying);
  };

  const nextSong = () => {
    if (!currentSong || !songs.length) return;
    const idx = songs.findIndex((s) => s._id === currentSong._id);
    playSong(songs[(idx + 1) % songs.length]);
  };

  const prevSong = () => {
    if (!currentSong || !songs.length) return;
    const idx = songs.findIndex((s) => s._id === currentSong._id);
    playSong(songs[(idx - 1 + songs.length) % songs.length]);
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ":" + (sec < 10 ? "0" : "") + sec;
  };

  const featuredSong = songs[0];

  return (
    <div className="min-h-screen bg-luo-black pb-28">
      <TopNav user={user} />

      {/* HERO */}
      <section className="relative overflow-hidden bg-luo-yellow text-black">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1547055643-735ad07e308d?w=1600&q=80&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover opacity-30 mix-blend-multiply"
          />
        </div>

        {/* Diagonal black panel */}
        <div className="absolute inset-y-0 right-0 w-1/2 bg-luo-black [clip-path:polygon(20%_0,100%_0,100%_100%,0_100%)] hidden md:block" />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-8 items-center">
          <div className="animate-slide-up">
            <span className="label-block">Feel The Beat</span>
            <h1 className="h-display text-5xl md:text-7xl mt-4 mb-6">
              Rhythm
              <br />
              of the
              <br />
              <span className="bg-black text-luo-yellow px-3 inline-block">
                Nile
              </span>
            </h1>
            <p className="text-black/80 text-lg max-w-md mb-8 font-medium">
              The sound of the Luo people of South Sudan. Traditional drums,
              modern Afrobeat, and the voices of the Nile —{" "}
              <strong>{songs.length} tracks</strong> and growing.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => songs.length && playSong(songs[0])}
                className="btn-primary"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play All
              </button>
              <Link href="/about" className="btn-outline !border-black !text-black hover:!bg-black hover:!text-white">
                Our Story
              </Link>
            </div>
          </div>

          {/* Featured track card on the right */}
          {featuredSong && (
            <div className="relative animate-slide-up hidden md:block">
              <div className="absolute -top-4 -left-4 w-full h-full bg-luo-red" />
              <div className="relative bg-luo-black border-2 border-white p-6">
                <span className="label-green">Featured</span>
                <div className="mt-4 flex gap-4 items-center">
                  <div className="w-28 h-28 shrink-0 overflow-hidden border-2 border-luo-yellow">
                    {featuredSong.posterUrl ? (
                      <img
                        src={featuredSong.posterUrl}
                        alt={featuredSong.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-luo-ink flex items-center justify-center text-luo-yellow text-3xl font-display">
                        ♪
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display uppercase text-2xl text-white truncate">
                      {featuredSong.title}
                    </p>
                    <p className="text-white/60 text-sm font-medium">
                      {featuredSong.artist}
                    </p>
                    <p className="text-luo-yellow text-xs uppercase tracking-wide mt-1">
                      {featuredSong.category} · {featuredSong.duration}
                    </p>
                    <button
                      onClick={() => playSong(featuredSong)}
                      className="mt-3 text-luo-red font-bold uppercase text-sm hover:underline flex items-center gap-1"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Play sample
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Diagonal stripe at bottom */}
        <div className="h-3 stripe-accent" />
      </section>

      {/* MARQUEE strip */}
      <div className="bg-luo-black border-y border-luo-yellow/30 overflow-hidden">
        <div className="flex gap-12 py-3 animate-marquee whitespace-nowrap will-change-transform">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-12 items-center shrink-0">
              {["Nilotic Beat", "South Sudan", "Live the Sound", "Drums of the Nile", "Sweat to the Beat", "Luo Heritage"].map(
                (t) => (
                  <span
                    key={t}
                    className="font-display uppercase text-luo-yellow text-xl tracking-wide"
                  >
                    {t} <span className="text-luo-red">★</span>
                  </span>
                )
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SEARCH + CATEGORY FILTERS */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
          <h2 className="h-display text-3xl md:text-4xl">
            All <span className="text-luo-yellow">Tracks</span>
          </h2>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search songs or artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input !py-2 !pl-10 !w-64"
            />
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {(["all", "luo", "bollywood"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all
                ${
                  activeCategory === cat
                    ? "bg-luo-yellow text-black"
                    : "bg-luo-ink text-white/60 hover:text-white"
                }`}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>

        {filteredSongs.length === 0 ? (
          <div className="text-center py-20 text-white/40 border-2 border-dashed border-white/10 rounded-sm">
            <p className="font-display uppercase text-2xl">No tracks found</p>
            <p className="text-sm mt-2">Try a different search or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSongs.map((song, i) => (
              <div
                key={song._id}
                className={`card p-3 flex items-center gap-3 cursor-pointer group
                  ${currentSong?._id === song._id ? "!border-luo-yellow !bg-luo-yellow/5" : ""}`}
                onClick={() => playSong(song)}
              >
                <div className="w-16 h-16 shrink-0 overflow-hidden bg-luo-ink relative">
                  {song.posterUrl ? (
                    <img
                      src={song.posterUrl}
                      alt={song.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-luo-yellow text-2xl font-display">
                      ♪
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <svg
                      className="w-6 h-6 text-luo-yellow"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {currentSong?._id === song._id && isPlaying ? (
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      ) : (
                        <path d="M8 5v14l11-7z" />
                      )}
                    </svg>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`font-bold truncate ${currentSong?._id === song._id ? "text-luo-yellow" : "text-white"}`}
                  >
                    {song.title}
                  </p>
                  <p className="text-xs text-white/50 truncate">{song.artist}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase tracking-wider text-luo-green font-bold">
                      {song.category}
                    </span>
                    <span className="text-[10px] text-white/30">·</span>
                    <span className="text-[10px] text-white/40">
                      {song.duration}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowComments(
                      showComments === song._id ? null : song._id
                    );
                  }}
                  className="btn-icon relative"
                  title="Comments"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  {song.commentCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-luo-red text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {song.commentCount}
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* About teaser */}
      <section className="bg-luo-yellow text-black border-y-4 border-black">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 grid md:grid-cols-2 gap-8 items-center">
          <div className="relative aspect-[4/3] overflow-hidden border-4 border-black">
            <img
              src="https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&q=80&auto=format&fit=crop"
              alt="The Nile River"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="bg-black text-luo-yellow font-display uppercase text-sm px-3 py-1 inline-block">
              The People
            </span>
            <h2 className="h-display text-4xl md:text-5xl mt-4 mb-4">
              From the Banks of the<br />
              <span className="bg-black text-luo-yellow px-2 inline-block">
                White Nile
              </span>
            </h2>
            <p className="text-black/80 text-lg font-medium mb-6 max-w-md">
              The Luo are a Nilotic people whose homeland traces along the Nile
              in South Sudan. For centuries, song and drum have been the way
              history, love, and resistance are kept alive.
            </p>
            <Link href="/about" className="btn-primary">
              Read Our History
            </Link>
          </div>
        </div>
      </section>

      {/* COMMENTS PANEL */}
      {showComments && (
        <CommentsPanel
          songId={showComments as Id<"songs">}
          onClose={() => setShowComments(null)}
        />
      )}

      {/* PLAYER BAR */}
      <PlayerBar
        currentSong={currentSong}
        isPlaying={isPlaying}
        progress={progress}
        duration={duration}
        volume={volume}
        setVolume={(v) => {
          setVolume(v);
          if (audioRef.current) audioRef.current.volume = v / 100;
        }}
        formatTime={formatTime}
        togglePlay={togglePlay}
        nextSong={nextSong}
        prevSong={prevSong}
        onSeek={(percent) => {
          if (audioRef.current && audioRef.current.duration) {
            audioRef.current.currentTime =
              (percent / 100) * audioRef.current.duration;
          }
        }}
      />

      <audio
        ref={audioRef}
        src={currentSong?.audioUrl ?? undefined}
        onTimeUpdate={() => {
          if (!audioRef.current) return;
          setProgress(
            (audioRef.current.currentTime / audioRef.current.duration) * 100 ||
              0
          );
        }}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => {
          if (currentSong) incrementPlays({ songId: currentSong._id });
          nextSong();
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  );
}

// ----- Signed-out landing -----
function SignedOutHome({ songCount }: { songCount: number }) {
  return (
    <div className="min-h-screen bg-luo-yellow text-black relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1547055643-735ad07e308d?w=1600&q=80&auto=format&fit=crop"
          alt=""
          className="w-full h-full object-cover opacity-25 mix-blend-multiply"
        />
      </div>

      {/* Black panel */}
      <div className="absolute inset-y-0 right-0 w-2/3 bg-luo-black [clip-path:polygon(25%_0,100%_0,100%_100%,0_100%)] hidden md:block" />

      <div className="relative min-h-screen flex flex-col">
        <header className="flex items-center justify-between px-6 md:px-12 py-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-black flex items-center justify-center rotate-[-6deg]">
              <span className="font-display text-luo-yellow text-xl">L</span>
            </div>
            <span className="font-display uppercase text-xl">
              Luo<span className="text-luo-red">Music</span>
            </span>
          </div>
          <Link href="/auth" className="btn-primary">
            Sign In
          </Link>
        </header>

        <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 py-12 grid md:grid-cols-2 gap-8 items-center">
          <div className="animate-slide-up">
            <span className="label-block">Feel The Beat</span>
            <h1 className="h-display text-5xl md:text-7xl mt-4 mb-6">
              Rhythm
              <br />
              of the
              <br />
              <span className="bg-black text-luo-yellow px-3 inline-block">
                Nile
              </span>
            </h1>
            <p className="text-black/80 text-lg max-w-md mb-8 font-medium">
              {songCount}+ Luo tracks. Traditional drums. Modern Afrobeat.
              Conversations with people who carry the rhythm of South Sudan.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/auth" className="btn-primary">
                Get Started
              </Link>
              <Link
                href="/about"
                className="btn-outline !border-black !text-black hover:!bg-black hover:!text-white"
              >
                About The Luo
              </Link>
            </div>
          </div>

          <div className="relative animate-slide-up hidden md:block">
            <div className="absolute -top-4 -left-4 w-full h-full bg-luo-red" />
            <div className="relative aspect-[4/5] overflow-hidden border-4 border-black">
              <img
                src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&q=80&auto=format&fit=crop"
                alt="African dancer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </main>

        <div className="h-3 stripe-accent" />
      </div>
    </div>
  );
}

// ----- Sticky player bar -----
function PlayerBar({
  currentSong,
  isPlaying,
  progress,
  duration,
  volume,
  setVolume,
  formatTime,
  togglePlay,
  nextSong,
  prevSong,
  onSeek,
}: {
  currentSong: any;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  setVolume: (v: number) => void;
  formatTime: (s: number) => string;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  onSeek: (percent: number) => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-luo-ink border-t-2 border-luo-yellow">
      <div
        className="absolute top-0 left-0 right-0 h-1.5 bg-white/5 cursor-pointer group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          onSeek(((e.clientX - rect.left) / rect.width) * 100);
        }}
      >
        <div
          className="h-full bg-luo-red transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center gap-4 h-20">
        {/* Song info */}
        <div className="flex items-center gap-3 w-1/4 min-w-0">
          {currentSong ? (
            <>
              <div className="w-12 h-12 shrink-0 overflow-hidden border border-luo-yellow/40">
                {currentSong.posterUrl ? (
                  <img
                    src={currentSong.posterUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-luo-black flex items-center justify-center text-luo-yellow text-xl font-display">
                    ♪
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm truncate">
                  {currentSong.title}
                </p>
                <p className="text-xs text-white/50 truncate">
                  {currentSong.artist}
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-white/30">Select a song</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <button onClick={prevSong} className="btn-icon">
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>
            <button
              onClick={togglePlay}
              className="w-11 h-11 bg-luo-yellow text-black flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 ml-0.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <button onClick={nextSong} className="btn-icon">
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-white/40 w-full max-w-md">
            <span className="w-10 text-right tabular-nums">
              {formatTime((progress / 100) * duration)}
            </span>
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-luo-yellow"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="w-10 tabular-nums">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="hidden md:flex items-center gap-2 w-1/4 justify-end">
          <svg
            className="w-4 h-4 text-white/50"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
          </svg>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(+e.target.value)}
            className="w-24 h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-luo-yellow [&::-webkit-slider-thumb]:rounded-full"
          />
        </div>
      </div>
    </div>
  );
}

// ----- Comments panel -----
function CommentsPanel({
  songId,
  onClose,
}: {
  songId: Id<"songs">;
  onClose: () => void;
}) {
  const comments = useQuery(api.comments.listBySong, { songId });
  const addComment = useMutation(api.comments.add);
  const toggleLike = useMutation(api.likes.toggle);
  const removeComment = useMutation(api.comments.remove);
  const [text, setText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await addComment({ songId, text: text.trim() });
    setText("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-luo-ink border-2 border-luo-yellow max-h-[80vh] flex flex-col animate-slide-up rounded-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-luo-yellow bg-luo-yellow text-black">
          <h3 className="font-display uppercase text-lg">Comments</h3>
          <button onClick={onClose} className="hover:scale-110 transition-all">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {comments?.length === 0 ? (
            <p className="text-center text-white/40 py-10 font-medium">
              No comments yet. Be the first!
            </p>
          ) : (
            comments?.map((comment) => (
              <div
                key={comment._id}
                className="flex gap-3 animate-fade-in"
              >
                <div className="w-9 h-9 rounded-sm bg-luo-yellow flex items-center justify-center text-black font-display shrink-0 overflow-hidden">
                  {comment.userAvatar ? (
                    <img
                      src={comment.userAvatar}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    comment.userName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">
                      {comment.userName}
                    </span>
                    <span className="text-[11px] text-white/30">
                      {new Date(comment._creationTime).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-white/80 mt-1">{comment.text}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() =>
                        toggleLike({
                          targetId: comment._id,
                          targetType: "comment",
                        })
                      }
                      className={`flex items-center gap-1 text-xs font-bold uppercase transition-colors ${
                        comment.isLiked
                          ? "text-luo-red"
                          : "text-white/40 hover:text-luo-red"
                      }`}
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill={comment.isLiked ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      {comment.likeCount > 0 ? comment.likeCount : "Like"}
                    </button>
                    {comment.isOwner && (
                      <button
                        onClick={() =>
                          removeComment({ commentId: comment._id })
                        }
                        className="text-xs text-white/30 hover:text-luo-red font-bold uppercase transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-4 border-t-2 border-white/10 flex gap-2"
        >
          <input
            type="text"
            placeholder="Drop a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="input !py-2"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="btn-yellow !px-4 disabled:opacity-30"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
