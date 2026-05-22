"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

type NavUser = {
  name?: string;
  email?: string;
  avatarUrl?: string | null;
} | null | undefined;

export default function TopNav({ user }: { user: NavUser }) {
  const pathname = usePathname();
  const { signOut } = useAuthActions();
  const [open, setOpen] = useState(false);

  const displayName =
    user?.name?.trim() || user?.email?.split("@")[0] || "Guest";
  const initial = displayName.charAt(0).toUpperCase();

  const links: Array<{ href: string; label: string }> = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/chat", label: "Live Chat" },
    { href: "/profile", label: "Profile" },
    { href: "/profile?tab=uploads", label: "Upload" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-luo-black/90 backdrop-blur-md border-b-2 border-luo-yellow">
      <div className="max-w-7xl mx-auto flex items-center gap-6 px-4 md:px-8 h-16">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 bg-luo-yellow flex items-center justify-center rotate-[-6deg]">
            <span className="font-display text-black text-lg">L</span>
          </div>
          <span className="font-display uppercase text-lg tracking-tight">
            Luo<span className="text-luo-yellow">Music</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 flex-1">
          {links.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href.split("?")[0]) &&
                  link.href.split("?")[0] !== "/";
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm font-bold uppercase tracking-wide rounded-sm transition-all
                  ${isActive ? "text-luo-yellow" : "text-white/70 hover:text-white"}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-2 px-2 py-1 hover:bg-white/5 rounded-sm transition-all"
              >
                <div className="w-9 h-9 rounded-sm bg-luo-yellow flex items-center justify-center text-black text-sm font-display overflow-hidden">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initial
                  )}
                </div>
                <span className="hidden md:block text-sm font-bold">
                  {displayName}
                </span>
              </Link>
              <button
                onClick={() => signOut()}
                className="btn-icon"
                title="Sign out"
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
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </>
          ) : (
            <Link href="/auth" className="btn-yellow !py-2 !px-4 text-sm">
              Sign In
            </Link>
          )}

          <button
            onClick={() => setOpen(!open)}
            className="btn-icon md:hidden"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-white/10 bg-luo-ink">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block px-6 py-3 text-sm font-bold uppercase tracking-wide hover:bg-white/5 border-b border-white/5"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
