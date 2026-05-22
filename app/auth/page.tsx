"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthPage() {
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace("/");
  }, [isAuthenticated, router]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "signUp" && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await signIn("password", { email, password, name, flow: mode });
    } catch (err: any) {
      const msg = (err?.data?.message ?? err?.message ?? "").toString();
      if (msg.includes("Invalid password")) {
        setError("Password must be at least 8 characters.");
      } else if (
        msg.includes("Invalid credentials") ||
        msg.toLowerCase().includes("invalid")
      ) {
        setError(
          mode === "signIn"
            ? "Incorrect email or password."
            : "Could not create account — try signing in instead.",
        );
      } else if (msg.includes("already exists")) {
        setError("An account with this email already exists. Try signing in.");
      } else {
        setError(msg || "Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-luo-black">
      {/* Left: brand panel */}
      <div className="hidden md:flex md:w-1/2 bg-luo-yellow text-black relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1400&q=80&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover opacity-25 mix-blend-multiply"
          />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="w-10 h-10 bg-black flex items-center justify-center rotate-[-6deg]">
              <span className="font-display text-luo-yellow text-xl">L</span>
            </div>
            <span className="font-display uppercase text-xl">
              Luo<span className="text-luo-red">Music</span>
            </span>
          </Link>

          <div>
            <span className="label-block !bg-black !text-luo-yellow">
              Welcome Back
            </span>
            <h1 className="h-display text-5xl lg:text-6xl mt-4">
              Feel the<br />
              <span className="bg-black text-luo-yellow px-3 inline-block">
                Rhythm
              </span>
            </h1>
            <p className="text-black/80 mt-6 max-w-md font-medium">
              Sign in to play the catalog, comment on tracks, message other
              listeners, and upload your own music.
            </p>
          </div>

          <div className="h-3 stripe-accent rounded-sm" />
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md animate-slide-up">
          <Link href="/" className="md:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-luo-yellow flex items-center justify-center rotate-[-6deg]">
              <span className="font-display text-black text-lg">L</span>
            </div>
            <span className="font-display uppercase text-lg">
              Luo<span className="text-luo-yellow">Music</span>
            </span>
          </Link>

          <h2 className="h-display text-3xl md:text-4xl mb-2">
            {mode === "signIn" ? "Sign in" : "Create account"}
          </h2>
          <p className="text-white/50 mb-8 text-sm">
            {mode === "signIn"
              ? "Welcome back. Pick up where you left off."
              : "Join the Luo Music community in less than a minute."}
          </p>

          {/* Mode toggle */}
          <div className="flex gap-1 mb-6 bg-luo-ink p-1 rounded-sm border border-white/10">
            <button
              onClick={() => setMode("signIn")}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
                mode === "signIn"
                  ? "bg-luo-yellow text-black"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("signUp")}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
                mode === "signUp"
                  ? "bg-luo-yellow text-black"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Guest */}
          <button
            onClick={async () => {
              try {
                await signIn("anonymous");
              } catch (err: any) {
                setError(err.message || "Failed to continue as guest");
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-3 mb-5 bg-luo-ink border-2 border-white/10 hover:border-luo-yellow font-bold uppercase tracking-wide text-sm transition-all rounded-sm"
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Continue as Guest
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] uppercase tracking-widest text-white/30">
              or with email
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-3">
            {mode === "signUp" && (
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                required
              />
            )}
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
            <input
              type="password"
              placeholder={
                mode === "signUp" ? "Password (min 8 characters)" : "Password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
              minLength={mode === "signUp" ? 8 : 1}
            />

            {error && (
              <div className="bg-luo-red/15 border border-luo-red text-luo-red text-sm font-medium px-4 py-2 rounded-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-60"
            >
              {loading
                ? "Loading..."
                : mode === "signIn"
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>

          <p className="text-center text-white/30 text-xs mt-8">
            Free forever. No credit card required.
          </p>
        </div>
      </div>
    </div>
  );
}
