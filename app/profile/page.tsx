"use client";

import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useRef, Suspense } from "react";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import TopNav from "@/components/TopNav";

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-luo-black">
          <div className="w-10 h-10 border-4 border-luo-yellow border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const searchParams = useSearchParams();
  const viewUserId = searchParams.get("userId") as Id<"users"> | null;
  return viewUserId ? <OtherProfile userId={viewUserId} /> : <OwnProfile />;
}

function OwnProfile() {
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.current, isAuthenticated ? {} : "skip");
  const updateProfile = useMutation(api.users.updateProfile);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const uploadSong = useMutation(api.songs.upload);

  const mySongs = useQuery(
    api.songs.listByUser,
    user ? { userId: user._id } : "skip",
  );
  const followerCount = useQuery(
    api.follows.followers,
    user ? { userId: user._id } : "skip",
  );
  const followingCount = useQuery(
    api.follows.following,
    user ? { userId: user._id } : "skip",
  );

  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "uploads" ? "uploads" : "profile";

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [tab, setTab] = useState<"profile" | "uploads">(initialTab);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [songTitle, setSongTitle] = useState("");
  const [songArtist, setSongArtist] = useState("");
  const [songCategory, setSongCategory] = useState("uploaded");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  if (authLoading || (isAuthenticated && user === undefined)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-luo-black">
        <div className="w-10 h-10 border-4 border-luo-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-luo-black">
        <TopNav user={null} />
        <div className="max-w-2xl mx-auto p-8 text-center mt-20">
          <h1 className="h-display text-4xl mb-4">Please sign in</h1>
          <Link href="/auth" className="btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const displayName =
    user.name?.trim() || user.email?.split("@")[0] || "Guest";
  const initial = displayName.charAt(0).toUpperCase();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      await updateProfile({ avatarStorageId: storageId });
    } catch (err) {
      console.error("Avatar upload failed:", err);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        name: name || undefined,
        bio: bio || undefined,
      });
      setEditing(false);
    } catch (err) {
      console.error("Profile update failed:", err);
    }
  };

  const handleSongUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile || !songTitle || !songArtist) return;
    setUploading(true);
    setUploadProgress(10);

    try {
      const uploadUrl = await generateUploadUrl();
      setUploadProgress(30);
      const audioResult = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": audioFile.type },
        body: audioFile,
      });
      const { storageId: audioStorageId } = await audioResult.json();
      setUploadProgress(60);

      let posterStorageId = undefined;
      if (coverFile) {
        const coverUploadUrl = await generateUploadUrl();
        const coverResult = await fetch(coverUploadUrl, {
          method: "POST",
          headers: { "Content-Type": coverFile.type },
          body: coverFile,
        });
        const { storageId } = await coverResult.json();
        posterStorageId = storageId;
      }
      setUploadProgress(80);

      const audioUrl = URL.createObjectURL(audioFile);
      const audioEl = new Audio(audioUrl);
      await new Promise<void>((resolve) => {
        audioEl.addEventListener("loadedmetadata", () => resolve());
        audioEl.addEventListener("error", () => resolve());
      });
      const m = Math.floor(audioEl.duration / 60);
      const s = Math.floor(audioEl.duration % 60);
      const duration = m + ":" + (s < 10 ? "0" : "") + s;

      await uploadSong({
        title: songTitle,
        artist: songArtist,
        category: songCategory,
        duration,
        audioStorageId,
        posterStorageId: posterStorageId as any,
      });

      setUploadProgress(100);
      setSongTitle("");
      setSongArtist("");
      setAudioFile(null);
      setCoverFile(null);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-luo-black">
      <TopNav user={user} />

      {/* Banner */}
      <section className="relative bg-luo-yellow text-black overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1571974599782-87624638275f?w=1600&q=80&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover opacity-25 mix-blend-multiply"
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            <div className="relative">
              <div className="absolute -top-2 -left-2 w-full h-full bg-luo-red" />
              <div className="relative w-28 h-28 md:w-32 md:h-32 bg-luo-black border-4 border-black overflow-hidden">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-luo-yellow text-5xl font-display">
                    {initial}
                  </div>
                )}
              </div>
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-9 h-9 bg-luo-red text-white rounded-sm flex items-center justify-center hover:scale-110 transition-transform shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
                title="Change avatar"
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
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            <div className="flex-1">
              <span className="bg-black text-luo-yellow font-display uppercase text-xs px-3 py-1 inline-block">
                Profile
              </span>
              <h1 className="h-display text-4xl md:text-5xl mt-3">
                {displayName}
              </h1>
              <p className="text-black/70 font-medium mt-1">
                {user.email ?? "Anonymous"}
              </p>
              <div className="flex gap-4 mt-3 text-sm font-bold">
                <span>
                  <strong>{followerCount ?? 0}</strong> followers
                </span>
                <span>
                  <strong>{followingCount ?? 0}</strong> following
                </span>
                <span>
                  <strong>{mySongs?.length ?? 0}</strong> uploads
                </span>
              </div>
            </div>

            {!editing && (
              <button
                onClick={() => {
                  setName(user.name ?? "");
                  setBio(user.bio ?? "");
                  setEditing(true);
                }}
                className="btn-primary !py-2 !px-4 text-sm"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
        <div className="h-3 stripe-accent" />
      </section>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 mt-6 mb-4 flex gap-2">
        <button
          onClick={() => setTab("profile")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
            tab === "profile"
              ? "bg-luo-yellow text-black"
              : "bg-luo-ink text-white/50 hover:text-white"
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setTab("uploads")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
            tab === "uploads"
              ? "bg-luo-yellow text-black"
              : "bg-luo-ink text-white/50 hover:text-white"
          }`}
        >
          Upload Music
        </button>
      </div>

      <section className="max-w-4xl mx-auto px-4 md:px-8 pb-16">
        {tab === "profile" ? (
          <div className="card p-6">
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-white/40 font-bold mb-1 block">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="input"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-white/40 font-bold mb-1 block">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell people something about you..."
                    className="input min-h-[100px] resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveProfile} className="btn-yellow">
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="h-display text-2xl mb-4">Bio</h3>
                <p className="text-white/70 mb-6">
                  {user.bio?.trim() || "No bio yet. Tap Edit Profile to add one."}
                </p>

                <h3 className="h-display text-2xl mb-4 pt-4 border-t border-white/10">
                  Account
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-white/40 uppercase tracking-wider text-xs font-bold">
                      Name
                    </span>
                    <span>{user.name ?? "Not set"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-white/40 uppercase tracking-wider text-xs font-bold">
                      Email
                    </span>
                    <span>{user.email ?? "Anonymous"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-white/40 uppercase tracking-wider text-xs font-bold">
                      Provider
                    </span>
                    <span className="capitalize">
                      {user.provider ??
                        (user.isAnonymous ? "Anonymous" : "Password")}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-white/40 uppercase tracking-wider text-xs font-bold">
                      Joined
                    </span>
                    <span>
                      {new Date(user._creationTime).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {mySongs && mySongs.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <h3 className="h-display text-2xl mb-4">
                      Your <span className="text-luo-yellow">Uploads</span>
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {mySongs.map((song) => (
                        <div
                          key={song._id}
                          className="flex items-center gap-3 p-2 bg-luo-black border border-white/10 rounded-sm"
                        >
                          <div className="w-12 h-12 bg-luo-ink overflow-hidden shrink-0">
                            {song.posterUrl ? (
                              <img
                                src={song.posterUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-luo-yellow font-display text-xl">
                                ♪
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">
                              {song.title}
                            </p>
                            <p className="text-xs text-white/40 truncate">
                              {song.artist}
                            </p>
                          </div>
                          <span className="text-[10px] uppercase tracking-wider text-luo-yellow font-bold">
                            {song.plays} plays
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="card p-6">
            <h3 className="h-display text-2xl mb-1">
              Upload a <span className="text-luo-yellow">Track</span>
            </h3>
            <p className="text-white/50 text-sm mb-6">
              MP3, WAV, OGG or FLAC. Add a cover image to make it pop.
            </p>

            <form onSubmit={handleSongUpload} className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-white/40 font-bold mb-1 block">
                  Audio file *
                </label>
                <div
                  onClick={() => audioInputRef.current?.click()}
                  className="border-2 border-dashed border-white/15 rounded-sm p-6 text-center cursor-pointer hover:border-luo-yellow transition-all"
                >
                  {audioFile ? (
                    <div>
                      <svg
                        className="w-8 h-8 text-luo-yellow mx-auto mb-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                      </svg>
                      <p className="text-sm font-bold">{audioFile.name}</p>
                      <p className="text-xs text-white/40">
                        {(audioFile.size / 1048576).toFixed(1)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <svg
                        className="w-8 h-8 text-white/20 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-sm text-white/60">
                        Click to select audio
                      </p>
                      <p className="text-xs text-white/30 mt-1">
                        MP3, WAV, OGG, FLAC
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-white/40 font-bold mb-1 block">
                    Song title *
                  </label>
                  <input
                    type="text"
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-white/40 font-bold mb-1 block">
                    Artist *
                  </label>
                  <input
                    type="text"
                    value={songArtist}
                    onChange={(e) => setSongArtist(e.target.value)}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-white/40 font-bold mb-1 block">
                  Category
                </label>
                <select
                  value={songCategory}
                  onChange={(e) => setSongCategory(e.target.value)}
                  className="input"
                >
                  <option value="uploaded">General</option>
                  <option value="luo">Luo</option>
                  <option value="bollywood">Bollywood</option>
                </select>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-white/40 font-bold mb-1 block">
                  Cover image
                </label>
                <div
                  onClick={() => coverInputRef.current?.click()}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div className="w-16 h-16 bg-luo-black border-2 border-white/10 flex items-center justify-center overflow-hidden">
                    {coverFile ? (
                      <img
                        src={URL.createObjectURL(coverFile)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        className="w-6 h-6 text-white/30"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-white/50">
                    Choose cover image
                  </span>
                </div>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </div>

              {uploadProgress > 0 && (
                <div>
                  <div className="h-2 bg-white/10 rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-luo-yellow transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-white/40 mt-1 text-center font-bold uppercase tracking-widest">
                    {uploadProgress < 100 ? "Uploading..." : "Upload complete!"}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  uploading || !audioFile || !songTitle || !songArtist
                }
                className="w-full btn-primary disabled:opacity-30"
              >
                {uploading ? "Uploading..." : "Upload Track"}
              </button>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}

function OtherProfile({ userId }: { userId: Id<"users"> }) {
  const currentUser = useQuery(api.users.current);
  const profileUser = useQuery(api.users.get, { userId });
  const isFollowing = useQuery(api.follows.isFollowing, { followingId: userId });
  const toggleFollow = useMutation(api.follows.toggle);
  const followerCount = useQuery(api.follows.followers, { userId });
  const followingCount = useQuery(api.follows.following, { userId });
  const userSongs = useQuery(api.songs.listByUser, { userId });

  if (profileUser === undefined || currentUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-luo-black">
        <div className="w-10 h-10 border-4 border-luo-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (profileUser === null) {
    return (
      <div className="min-h-screen bg-luo-black">
        <TopNav user={currentUser ?? null} />
        <div className="max-w-2xl mx-auto p-8 text-center mt-20">
          <h1 className="h-display text-4xl mb-4">User not found</h1>
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const displayName =
    profileUser.name?.trim() || profileUser.email?.split("@")[0] || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-luo-black">
      <TopNav user={currentUser ?? null} />

      <section className="relative bg-luo-yellow text-black overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1571974599782-87624638275f?w=1600&q=80&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover opacity-25 mix-blend-multiply"
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            <div className="relative">
              <div className="absolute -top-2 -left-2 w-full h-full bg-luo-red" />
              <div className="relative w-28 h-28 md:w-32 md:h-32 bg-luo-black border-4 border-black overflow-hidden">
                {profileUser.avatarUrl ? (
                  <img
                    src={profileUser.avatarUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-luo-yellow text-5xl font-display">
                    {initial}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              <span className="bg-black text-luo-yellow font-display uppercase text-xs px-3 py-1 inline-block">
                Listener
              </span>
              <h1 className="h-display text-4xl md:text-5xl mt-3">
                {displayName}
              </h1>
              <p className="text-black/70 font-medium mt-1">
                {profileUser.email ?? ""}
              </p>
              <div className="flex gap-4 mt-3 text-sm font-bold">
                <span>
                  <strong>{followerCount ?? 0}</strong> followers
                </span>
                <span>
                  <strong>{followingCount ?? 0}</strong> following
                </span>
              </div>
            </div>

            {currentUser && currentUser._id !== userId && (
              <button
                onClick={() => toggleFollow({ followingId: userId })}
                className={isFollowing ? "btn-outline !border-black !text-black" : "btn-primary"}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>
        <div className="h-3 stripe-accent" />
      </section>

      <section className="max-w-4xl mx-auto px-4 md:px-8 py-10">
        {profileUser.bio && (
          <div className="card p-6 mb-6">
            <h3 className="h-display text-xl mb-2">Bio</h3>
            <p className="text-white/70">{profileUser.bio}</p>
          </div>
        )}

        {userSongs && userSongs.length > 0 && (
          <div className="card p-6">
            <h3 className="h-display text-2xl mb-4">
              Tracks <span className="text-luo-yellow">({userSongs.length})</span>
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {userSongs.map((song) => (
                <div
                  key={song._id}
                  className="flex items-center gap-3 p-2 bg-luo-black border border-white/10 rounded-sm"
                >
                  <div className="w-12 h-12 bg-luo-ink overflow-hidden shrink-0">
                    {song.posterUrl ? (
                      <img
                        src={song.posterUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-luo-yellow font-display text-xl">
                        ♪
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{song.title}</p>
                    <p className="text-xs text-white/40 truncate">
                      {song.artist}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-luo-yellow font-bold">
                    {song.plays} plays
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
