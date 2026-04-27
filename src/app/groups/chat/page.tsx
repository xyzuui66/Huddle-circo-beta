"use client";

import { useState, useEffect, useRef } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { useFileUpload } from "@/hooks/useFileUpload";
import type { Group, GroupMember, Message } from "@/types";
import {
  Send,
  Plus,
  Image,
  Mic,
  Phone,
  Video,
  Settings,
  Users,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

export default function GroupChatsPage() {
  const { user, profile } = useAuth();
  const { uploadFile, uploading } = useFileUpload();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUserGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupMessages();
      fetchGroupMembers();

      const channel = supabase
        .channel(`group-${selectedGroup.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `group_id=eq.${selectedGroup.id}`,
          },
          (payload) => {
            fetchGroupMessages();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedGroup]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchUserGroups() {
    if (!user) return;

    const { data } = await supabase
      .from("group_members")
      .select("group:groups(*)")
      .eq("user_id", user.id);

    if (data) {
      setGroups(data.map((item: any) => item.group));
    }
    setLoading(false);
  }

  async function fetchGroupMessages() {
    if (!selectedGroup) return;

    const { data } = await supabase
      .from("messages")
      .select("*, profile:profiles(*)")
      .eq("group_id", selectedGroup.id)
      .order("created_at", { ascending: true });

    if (data) setMessages(data as Message[]);
  }

  async function fetchGroupMembers() {
    if (!selectedGroup) return;

    const { data } = await supabase
      .from("group_members")
      .select("*, profile:profiles(*)")
      .eq("group_id", selectedGroup.id);

    if (data) setMembers(data as GroupMember[]);
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!messageText.trim() || !user || !selectedGroup) return;

    setSending(true);

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      group_id: selectedGroup.id,
      content: messageText.trim(),
      message_type: "text",
    });

    if (error) {
      toast.error("Gagal kirim pesan!");
    } else {
      setMessageText("");
      fetchGroupMessages();
    }
    setSending(false);
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user || !selectedGroup) return;

    toast.loading("Uploading...");

    const url = await uploadFile(file, {
      bucket: "media",
      folder: `groups/${selectedGroup.id}`,
      maxSize: 50 * 1024 * 1024,
    });

    if (!url) return;

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      group_id: selectedGroup.id,
      content: "Mengirim media",
      message_type: file.type.startsWith("image/") ? "image" : "video",
      media_url: url,
    });

    if (error) {
      toast.error("Gagal kirim media!");
    } else {
      toast.success("Media berhasil dikirim!");
      fetchGroupMessages();
    }
  }

  const userMembership = members.find((m) => m.user_id === user?.id);
  const isAdmin = userMembership?.role === "admin";

  if (selectedGroup) {
    return (
      <MainLayout>
        <div className="flex flex-col h-full max-h-screen">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedGroup(null)}
                className="btn-ghost p-2"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {selectedGroup.name}
                </h2>
                <p className="text-xs text-gray-500">{members.length} anggota</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-ghost p-2">
                <Phone size={18} />
              </button>
              <button className="btn-ghost p-2">
                <Video size={18} />
              </button>
              <button className="btn-ghost p-2">
                <Users size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-sm">Belum ada pesan</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${
                    msg.sender_id === user?.id ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {msg.sender_id !== user?.id && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {msg.profile?.username?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}

                  <div
                    className={`flex flex-col ${
                      msg.sender_id === user?.id
                        ? "items-end"
                        : "items-start"
                    } max-w-[75%]`}
                  >
                    {msg.sender_id !== user?.id && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-1">
                        {msg.profile?.username}
                      </span>
                    )}

                    {msg.message_type === "text" ? (
                      <div
                        className={`message-bubble ${
                          msg.sender_id === user?.id ? "sent" : "received"
                        }`}
                      >
                        <p className="break-words">{msg.content}</p>
                      </div>
                    ) : msg.message_type === "image" ? (
                      <img
                        src={msg.media_url!}
                        className="max-w-sm rounded-xl"
                        alt=""
                      />
                    ) : (
                      <video
                        src={msg.media_url!}
                        controls
                        className="max-w-sm rounded-xl"
                      />
                    )}

                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                      {formatDistanceToNow(new Date(msg.created_at), {
                        addSuffix: true,
                        locale: id,
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
            <form onSubmit={sendMessage} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-400 hover:text-blue-500 transition-colors p-2"
              >
                <Image size={20} />
              </button>
              <button
                type="button"
                onClick={() => toast("Kirim suara segera hadir!")}
                className="text-gray-400 hover:text-blue-500 transition-colors p-2"
              >
                <Mic size={20} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,video/*"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
              />
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Ketik pesan..."
                className="input flex-1 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={!messageText.trim() || sending || uploading}
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

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Grup
          </h1>
          <button
            onClick={() => toast("Fitur buat grup segera hadir!")}
            className="btn-primary flex items-center gap-2 py-2 px-4 text-sm"
          >
            <Plus size={16} />
            Buat Grup
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Memuat...</div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            Kamu belum bergabung ke grup apapun
          </div>
        ) : (
          <div className="space-y-2">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group)}
                className="w-full card p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {group.avatar_url ? (
                    <img
                      src={group.avatar_url}
                      className="w-full h-full rounded-2xl object-cover"
                      alt=""
                    />
                  ) : (
                    group.name[0].toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {group.name}
                  </p>
                  {group.description && (
                    <p className="text-gray-500 text-sm truncate">
                      {group.description}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">→</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
