"use client";

import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import TopNav from "@/components/TopNav";

export default function ChatPage() {
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.current, isAuthenticated ? {} : "skip");
  const conversations = useQuery(
    api.chat.listConversations,
    isAuthenticated ? {} : "skip",
  );
  const sendMessage = useMutation(api.chat.sendMessage);
  const getOrCreateConversation = useMutation(api.chat.getOrCreateConversation);

  const [activeConv, setActiveConv] = useState<Id<"conversations"> | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const searchResults = useQuery(
    api.users.search,
    searchQuery.length > 0 ? { query: searchQuery } : "skip",
  );
  const messages = useQuery(
    api.chat.listMessages,
    activeConv ? { conversationId: activeConv } : "skip",
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
          <h1 className="h-display text-4xl mb-4">Please sign in to chat</h1>
          <Link href="/auth" className="btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConv) return;
    await sendMessage({
      conversationId: activeConv,
      text: messageText.trim(),
    });
    setMessageText("");
  };

  const startChat = async (otherUserId: Id<"users">) => {
    const convId = await getOrCreateConversation({ otherUserId });
    setActiveConv(convId);
    setSearchQuery("");
  };

  const activeConversation = conversations?.find((c) => c._id === activeConv);
  const filteredUsers = searchResults?.filter((u) => u._id !== user._id) ?? [];

  return (
    <div className="min-h-screen bg-luo-black flex flex-col">
      <TopNav user={user} />

      <div className="flex-1 max-w-7xl w-full mx-auto px-2 md:px-4 py-4">
        <div className="flex h-[calc(100vh-6rem)] border-2 border-luo-yellow/20 rounded-sm overflow-hidden bg-luo-ink">
          {/* Sidebar */}
          <div
            className={`${activeConv ? "hidden md:flex" : "flex"} flex-col w-full md:w-80 border-r-2 border-luo-yellow/20`}
          >
            <div className="p-4 border-b-2 border-luo-yellow/20">
              <h2 className="h-display text-xl mb-4">
                Live <span className="text-luo-yellow">Chat</span>
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
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input !py-2 !pl-10"
                />
              </div>
              {searchQuery.length > 0 && filteredUsers.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pt-3 -mb-1">
                  {filteredUsers.map((u) => {
                    const initial = (
                      u.name?.trim() ||
                      u.email?.split("@")[0] ||
                      "U"
                    )
                      .charAt(0)
                      .toUpperCase();
                    return (
                      <button
                        key={u._id}
                        onClick={() => startChat(u._id)}
                        className="flex flex-col items-center gap-1 min-w-[64px] group"
                      >
                        <div className="relative">
                          <div className="w-11 h-11 rounded-sm bg-luo-yellow text-black flex items-center justify-center text-sm font-display overflow-hidden group-hover:ring-2 group-hover:ring-luo-red transition-all">
                            {u.avatarUrl ? (
                              <img
                                src={u.avatarUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              initial
                            )}
                          </div>
                          {u.isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-luo-green rounded-full border-2 border-luo-ink" />
                          )}
                        </div>
                        <span className="text-[10px] text-white/50 truncate w-full text-center">
                          {u.name ?? u.email?.split("@")[0] ?? "User"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversations?.length === 0 ? (
                <div className="p-8 text-center text-white/30">
                  <p className="font-display uppercase text-lg">
                    No conversations
                  </p>
                  <p className="text-xs mt-1">
                    Search for users above to start one.
                  </p>
                </div>
              ) : (
                conversations?.map((conv) => {
                  const other = conv.others[0];
                  const initial = (
                    other?.name?.trim() ||
                    other?.email?.split("@")[0] ||
                    "?"
                  )
                    .charAt(0)
                    .toUpperCase();
                  return (
                    <button
                      key={conv._id}
                      onClick={() => setActiveConv(conv._id)}
                      className={`w-full flex items-center gap-3 p-4 border-b border-white/5 hover:bg-luo-black transition-all
                                  ${activeConv === conv._id ? "bg-luo-yellow/10 border-l-4 border-l-luo-yellow" : ""}`}
                    >
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-sm bg-luo-yellow text-black flex items-center justify-center text-sm font-display overflow-hidden">
                          {other?.avatarUrl ? (
                            <img
                              src={other.avatarUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            initial
                          )}
                        </div>
                        {other?.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-luo-green rounded-full border-2 border-luo-ink" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-bold truncate">
                          {conv.others
                            .map(
                              (o) =>
                                o.name ?? o.email?.split("@")[0] ?? "User",
                            )
                            .join(", ")}
                        </p>
                        <p className="text-xs text-white/40 truncate">
                          {conv.lastMessage ?? "Start chatting..."}
                        </p>
                      </div>
                      {conv.lastMessageTime && (
                        <span className="text-[10px] text-white/30">
                          {new Date(
                            conv.lastMessageTime,
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat area */}
          <div
            className={`${activeConv ? "flex" : "hidden md:flex"} flex-1 flex-col`}
          >
            {activeConv ? (
              <>
                <div className="h-14 flex items-center gap-3 px-4 border-b-2 border-luo-yellow/20 shrink-0 bg-luo-black">
                  <button
                    onClick={() => setActiveConv(null)}
                    className="btn-icon md:hidden"
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
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <div className="relative">
                    <div className="w-9 h-9 rounded-sm bg-luo-yellow text-black flex items-center justify-center text-sm font-display overflow-hidden">
                      {activeConversation?.others[0]?.avatarUrl ? (
                        <img
                          src={activeConversation.others[0].avatarUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (
                          activeConversation?.others[0]?.name?.trim() ||
                          activeConversation?.others[0]?.email?.split("@")[0] ||
                          "?"
                        )
                          .charAt(0)
                          .toUpperCase()
                      )}
                    </div>
                    {activeConversation?.others[0]?.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-luo-green rounded-full border-2 border-luo-black" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold">
                      {activeConversation?.others
                        .map(
                          (o) =>
                            o.name ?? o.email?.split("@")[0] ?? "User",
                        )
                        .join(", ")}
                    </p>
                    <p
                      className={`text-[10px] font-bold uppercase tracking-wider ${activeConversation?.others[0]?.isOnline ? "text-luo-green" : "text-white/30"}`}
                    >
                      {activeConversation?.others[0]?.isOnline
                        ? "Online"
                        : "Offline"}
                    </p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-luo-black">
                  {messages?.map((msg) => {
                    const isMe = msg.userId === user._id;
                    return (
                      <div
                        key={msg._id}
                        className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}
                      >
                        {!isMe && (
                          <div className="w-8 h-8 rounded-sm bg-luo-yellow text-black flex items-center justify-center text-xs font-display shrink-0 overflow-hidden">
                            {msg.userAvatar ? (
                              <img
                                src={msg.userAvatar}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              msg.userName.charAt(0).toUpperCase()
                            )}
                          </div>
                        )}
                        <div
                          className={`max-w-[70%] px-3.5 py-2 text-sm rounded-sm
                                       ${isMe ? "bg-luo-yellow text-black font-medium" : "bg-luo-ink border border-white/10"}`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <form
                  onSubmit={handleSend}
                  className="p-4 border-t-2 border-luo-yellow/20 flex gap-2 bg-luo-ink"
                >
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="input !py-2"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
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
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-white/30">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-luo-yellow/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p className="font-display uppercase text-xl">
                    Pick a conversation
                  </p>
                  <p className="text-sm mt-1">
                    Or search above to start a new one.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
