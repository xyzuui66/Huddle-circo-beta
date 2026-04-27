"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { User, Mail, FileText, ImageIcon } from "lucide-react";

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    bio: profile?.bio || "",
  });
  const [saving, setSaving] = useState(false);

  async function saveProfile() {
    if (!profile) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name,
        bio: form.bio,
      })
      .eq("id", profile.id);

    if (error) {
      toast.error("Gagal menyimpan profil!");
    } else {
      toast.success("Profil berhasil diperbarui!");
      setEditing(false);
      await refreshProfile();
    }
    setSaving(false);
  }

  if (!profile) return null;

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profil</h1>

        <div className="card p-6 space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-4xl">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  className="w-full h-full rounded-full object-cover"
                  alt=""
                />
              ) : (
                profile.username[0].toUpperCase()
              )}
            </div>
            <button
              onClick={() => toast("Upload foto profil segera hadir!")}
              className="flex items-center gap-2 text-blue-500 text-sm font-medium hover:text-blue-600"
            >
              <ImageIcon size={16} />
              Ganti Foto
            </button>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User size={16} className="text-gray-400" />
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Username
                </label>
              </div>
              <p className="text-gray-800 dark:text-gray-200 font-medium">
                @{profile.username}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Mail size={16} className="text-gray-400" />
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Nama Lengkap
                </label>
              </div>
              {editing ? (
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="input text-sm"
                />
              ) : (
                <p className="text-gray-800 dark:text-gray-200">
                  {profile.full_name || "-"}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText size={16} className="text-gray-400" />
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Bio
                </label>
              </div>
              {editing ? (
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="input resize-none h-20 text-sm"
                  placeholder="Ceritakan tentang diri kamu..."
                />
              ) : (
                <p className="text-gray-800 dark:text-gray-200 text-sm">
                  {profile.bio || "-"}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          {editing ? (
            <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setEditing(false)}
                className="btn-ghost flex-1 text-sm"
              >
                Batal
              </button>
              <button
                onClick={saveProfile}
                disabled={saving}
                className="btn-primary flex-1 text-sm"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="btn-primary w-full text-sm"
            >
              Edit Profil
            </button>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
