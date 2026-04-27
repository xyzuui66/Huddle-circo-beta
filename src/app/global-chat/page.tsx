"use client";

import { useState, useEffect, useRef } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import type { GlobalChatMessage } from "@/types";
import { Send, Image as ImageIcon, Mic, Smile, Phone } from "lucide-react";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

export default function GlobalChatPage() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<GlobalChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [onlineCount, setOnlineCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    fetchOnlineCount();

    const channel = supabase
      .channel("global-chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "global_chat" },
        async (payload) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", payload.new.user_id)
            .single();
          const newMsg = { ...payload.new, profile } as GlobalChatMessage;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchMessages() {
    const { data } = await supabase
      .from("global_chat")
      .select("*, profile:profiles(*)")
      .order("created_at", { ascending: true })
      .limit(100);
    if (data) setMessages(data as GlobalChatMessage[]);
    setLoading(false);
  }

  async function fetchOnlineCount() {
    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_online", true);
    setOnlineCount(count || 0);
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !user) return;

    const msg = text.trim();
    setText("");

    const { error } = await supabase.from("global_chat").insert({
      user_id: user.id,
      message: msg,
      message_type: "text",
    });

    if (error) toast.error("Gagal mengirim pesan!");
  }

  function getInitial(name?: string | null) {
    return name?.[0]?.toUpperCase() || "?";
  }

  return (
    <MainLayout>
      <div className="flex flex-col h-full max-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Chat Global
            </h1>
            <p className="text-xs text-green-500 font-medium">
              {onlineCount} pengguna online
            </p>
          </div>
          <button
            onClick={() => toast("Fitur Voice Room segera hadir!")}
            className="flex items-center gap-2 btn-ghost text-sm py-2 px-3"
          >
            <Phone size={16} />
            <span className="hidden sm:inline">Voice Room</span>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-sm">Memuat pesan...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <p className="text-gray-400 text-sm">Belum ada pesan</p>
              <p className="text-gray-300 text-xs">Jadilah yang pertama chat!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.user_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {msg.profile?.avatar_url ? (
                        <img
                          src={msg.profile.avatar_url}
                          className="w-full h-full rounded-full object-cover"
                          alt=""
                        />
                      ) : (
                        getInitial(msg.profile?.username)
                      )}
                    </div>
                  )}

                  <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%]`}>
                    {!isMe && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-1">
                        {msg.profile?.username || "User"}
                      </span>
                    )}
                    <div className={`message-bubble ${isMe ? "sent" : "received"}`}>
                      <p className="break-words">{msg.message}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                      {formatDistanceToNow(new Date(msg.created_at), {
                        addSuffix: true,
                        locale: id,
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
          <form onSubmit={sendMessage} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toast("Kirim foto segera hadir!")}
              className="text-gray-400 hover:text-blue-500 transition-colors p-2"
            >
              <ImageIcon size={20} />
            </button>
            <button
              type="button"
              onClick={() => toast("Kirim stiker segera hadir!")}
              className="text-gray-400 hover:text-blue-500 transition-colors p-2"
            >
              <Smile size={20} />
            </button>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ketik pesan..."
              className="input flex-1 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => toast("Rekam suara segera hadir!")}
              className="text-gray-400 hover:text-blue-500 transition-colors p-2"
            >
              <Mic size={20} />
            </button>
            <button
              type="submit"
              disabled={!text.trim()}
              className="btn-primary py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
