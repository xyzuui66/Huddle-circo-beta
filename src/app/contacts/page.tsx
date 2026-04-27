"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import type { Profile } from "@/types";
import { MessageCircle, Phone, Plus, Search, X, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactsPage() {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [savedContacts, setSavedContacts] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "saved">("saved");

  useEffect(() => {
    fetchUsers();
    fetchSavedContacts();
  }, []);

  async function fetchUsers() {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", user?.id || "")
      .order("username");

    if (data) setAllUsers(data);
    setLoading(false);
  }

  async function fetchSavedContacts() {
    if (!user) return;

    const { data } = await supabase
      .from("saved_contacts")
      .select("contact:profiles(*)")
      .eq("user_id", user.id);

    if (data) {
      setSavedContacts(data.map((item: any) => item.contact));
    }
  }

  async function saveContact(profileId: string) {
    if (!user) return;

    const { error } = await supabase.from("saved_contacts").insert({
      user_id: user.id,
      contact_id: profileId,
    });

    if (error) {
      toast.error("Gagal simpan kontak!");
      return;
    }

    toast.success("Kontak berhasil disimpan!");
    fetchSavedContacts();
  }

  async function removeSavedContact(profileId: string) {
    if (!user) return;

    const { error } = await supabase
      .from("saved_contacts")
      .delete()
      .eq("user_id", user.id)
      .eq("contact_id", profileId);

    if (error) {
      toast.error("Gagal hapus kontak!");
      return;
    }

    toast.success("Kontak berhasil dihapus!");
    fetchSavedContacts();
  }

  const isSaved = (profileId: string) =>
    savedContacts.some((c) => c.id === profileId);

  const usersToDisplay =
    activeTab === "saved" ? savedContacts : allUsers;
  const filtered = usersToDisplay.filter(
    (user) =>
      user.username?.toLowerCase().includes(search.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  function getInitial(name?: string | null) {
    return name?.[0]?.toUpperCase() || "?";
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Kontak
        </h1>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 text-sm"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("saved")}
            className={`pb-3 px-4 font-medium text-sm transition-colors ${
              activeTab === "saved"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Kontak Tersimpan
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-3 px-4 font-medium text-sm transition-colors ${
              activeTab === "all"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Semua Pengguna
          </button>
        </div>

        {/* Contacts List */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Memuat...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            {activeTab === "saved"
              ? "Belum ada kontak tersimpan"
              : "Tidak ada pengguna ditemukan"}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((contact) => (
              <div
                key={contact.id}
                className="card p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {contact.avatar_url ? (
                      <img
                        src={contact.avatar_url}
                        className="w-full h-full rounded-full object-cover"
                        alt=""
                      />
                    ) : (
                      getInitial(contact.username)
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {contact.full_name || contact.username}
                    </p>
                    <p className="text-gray-500 text-sm truncate">
                      @{contact.username}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 ml-3">
                  <button
                    onClick={() =>
                      isSaved(contact.id)
                        ? removeSavedContact(contact.id)
                        : saveContact(contact.id)
                    }
                    className={`p-2 rounded-xl transition-all ${
                      isSaved(contact.id)
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-blue-600"
                    }`}
                  >
                    {isSaved(contact.id) ? (
                      <Check size={18} />
                    ) : (
                      <Plus size={18} />
                    )}
                  </button>
                  <button className="btn-ghost text-blue-500 hover:text-blue-600 p-2">
                    <MessageCircle size={18} />
                  </button>
                  <button className="btn-ghost text-green-500 hover:text-green-600 p-2">
                    <Phone size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
