"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import type { Community } from "@/types";
import { Plus, Users, Globe, Lock, Search } from "lucide-react";
import toast from "react-hot-toast";

export default function CommunitiesPage() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", description: "", is_public: true });

  useEffect(() => { fetchCommunities(); }, []);

  async function fetchCommunities() {
    const { data } = await supabase
      .from("communities")
      .select("*")
      .order("member_count", { ascending: false });
    if (data) setCommunities(data);
    setLoading(false);
  }

  async function createCommunity() {
    if (!form.name.trim() || !user) return;
    const { error } = await supabase.from("communities").insert({
      name: form.name.trim(),
      description: form.description.trim() || null,
      is_public: form.is_public,
      created_by: user.id,
      member_count: 1,
    });
    if (error) { toast.error("Gagal membuat komunitas!"); return; }
    toast.success("Komunitas berhasil dibuat!");
    setShowCreate(false);
    setForm({ name: "", description: "", is_public: true });
    fetchCommunities();
  }

  const filtered = communities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Komunitas</h1>
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
            <Plus size={16} />
            Buat Komunitas
          </button>
        </div>

        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari komunitas..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-9 text-sm" />
        </div>

        {showCreate && (
          <div className="card p-5 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Buat Komunitas Baru</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Nama Komunitas" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input text-sm" />
              <textarea placeholder="Deskripsi komunitas..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input resize-none h-20 text-sm" />
              <div className="flex gap-2">
                <button onClick={() => setForm({ ...form, is_public: true })} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-all ${form.is_public ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600" : "border-gray-200 dark:border-gray-700 text-gray-500"}`}>
                  <Globe size={14} /> Publik
                </button>
                <button onClick={() => setForm({ ...form, is_public: false })} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-all ${!form.is_public ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600" : "border-gray-200 dark:border-gray-700 text-gray-500"}`}>
                  <Lock size={14} /> Private
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowCreate(false)} className="btn-ghost flex-1 text-sm">Batal</button>
                <button onClick={createCommunity} className="btn-primary flex-1 text-sm">Buat</button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400">Memuat...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Belum ada komunitas</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => (
              <div key={c.id} className="card p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {c.avatar_url ? <img src={c.avatar_url} className="w-full h-full rounded-2xl object-cover" alt="" /> : c.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{c.name}</p>
                    {c.is_public ? <Globe size={12} className="text-gray-400" /> : <Lock size={12} className="text-gray-400" />}
                  </div>
                  {c.description && <p className="text-gray-500 text-xs truncate mt-0.5">{c.description}</p>}
                  <div className="flex items-center gap-1 mt-1">
                    <Users size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-400">{c.member_count} anggota</span>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    await supabase.from("communities").update({ member_count: c.member_count + 1 }).eq("id", c.id);
                    toast.success("Berhasil bergabung!");
                    fetchCommunities();
                  }}
                  className="btn-secondary text-xs py-1.5 px-3 flex-shrink-0"
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
