"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import type { Group } from "@/types";
import { Plus, Users, Lock, Globe, Search } from "lucide-react";
import toast from "react-hot-toast";

export default function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", description: "", is_public: true });

  useEffect(() => {
    fetchGroups();
  }, []);

  async function fetchGroups() {
    const { data } = await supabase
      .from("groups")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setGroups(data);
    setLoading(false);
  }

  async function createGroup() {
    if (!form.name.trim() || !user) return;

    const { data, error } = await supabase
      .from("groups")
      .insert({
        name: form.name.trim(),
        description: form.description.trim() || null,
        is_public: form.is_public,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      toast.error("Gagal membuat grup!");
      return;
    }

    // Add creator as admin
    await supabase.from("group_members").insert({
      group_id: data.id,
      user_id: user.id,
      role: "admin",
    });

    toast.success("Grup berhasil dibuat!");
    setShowCreate(false);
    setForm({ name: "", description: "", is_public: true });
    fetchGroups();
  }

  async function joinGroup(groupId: string) {
    if (!user) return;

    const { error } = await supabase.from("group_members").insert({
      group_id: groupId,
      user_id: user.id,
      role: "member",
    });

    if (error) {
      toast.error("Gagal bergabung ke grup!");
    } else {
      toast.success("Berhasil bergabung ke grup!");
    }
  }

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Grup</h1>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="btn-primary flex items-center gap-2 py-2 px-4 text-sm"
          >
            <Plus size={16} />
            Buat Grup
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari grup..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 text-sm"
          />
        </div>

        {/* Create Form */}
        {showCreate && (
          <div className="card p-5 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Buat Grup Baru</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nama Grup"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input text-sm"
              />
              <textarea
                placeholder="Deskripsi (opsional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input resize-none h-20 text-sm"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setForm({ ...form, is_public: true })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-all ${
                    form.is_public
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600"
                      : "border-gray-200 dark:border-gray-700 text-gray-500"
                  }`}
                >
                  <Globe size={14} />
                  Publik
                </button>
                <button
                  onClick={() => setForm({ ...form, is_public: false })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-all ${
                    !form.is_public
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600"
                      : "border-gray-200 dark:border-gray-700 text-gray-500"
                  }`}
                >
                  <Lock size={14} />
                  Private
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowCreate(false)} className="btn-ghost flex-1 text-sm">
                  Batal
                </button>
                <button onClick={createGroup} className="btn-primary flex-1 text-sm">
                  Buat Grup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Groups List */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Memuat...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Belum ada grup</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((group) => (
              <div key={group.id} className="card p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {group.avatar_url ? (
                    <img src={group.avatar_url} className="w-full h-full rounded-2xl object-cover" alt="" />
                  ) : (
                    group.name[0].toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {group.name}
                    </p>
                    {group.is_public ? (
                      <Globe size={12} className="text-gray-400 flex-shrink-0" />
                    ) : (
                      <Lock size={12} className="text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                  {group.description && (
                    <p className="text-gray-500 text-xs truncate mt-0.5">
                      {group.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1 mt-1">
                    <Users size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-400">Grup</span>
                  </div>
                </div>
                <button
                  onClick={() => joinGroup(group.id)}
                  className="btn-primary text-xs py-1.5 px-3 flex-shrink-0"
                >
                  Gabung
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
