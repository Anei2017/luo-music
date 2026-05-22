"use client";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient, useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ReactNode, useState, useEffect } from "react";

function OnlineTracker() {
  const { isAuthenticated } = useConvexAuth();
  const setOnline = useMutation(api.users.setOnline);
  const setOffline = useMutation(api.users.setOffline);

  useEffect(() => {
    if (!isAuthenticated) return;
    setOnline().catch(() => {});
    const handleBeforeUnload = () => {
      setOffline().catch(() => {});
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") setOnline().catch(() => {});
      else setOffline().catch(() => {});
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      setOffline().catch(() => {});
    };
  }, [isAuthenticated, setOnline, setOffline]);

  return null;
}

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [convex] = useState(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set. Run `npx convex dev` first.");
    return new ConvexReactClient(url);
  });

  return (
    <ConvexAuthProvider client={convex}>
      <OnlineTracker />
      {children}
    </ConvexAuthProvider>
  );
}
