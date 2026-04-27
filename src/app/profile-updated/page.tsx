"use client";

import { useState, useRef } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { useFileUpload } from "@/hooks/useFileUpload";
import toast from "react-hot-toast";
import { User, Mail, FileText, ImageIcon, Loader } from "lucide-react";

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const { uploadFile, uploading } = useFileUpload();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    bio: profile?.bio || "",
  });
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Hanya gambar yang didukung!");
      return;
    }

    toast.loading("Uploading avatar...");

    const url = await uploadFile(file, {
      bucket: "avatars",
      folder: profile.id,
      maxSize: 5 * 1024 * 1024, // 5MB
    });

    if (!url) return;

    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: url })
      .eq("id", profile.id);

    if (error) {
      toast.error("Gagal update avatar!");
    } else {
      toast.success("Avatar berhasil diperbarui!");
      await refreshProfile();
    }
  }

  if (!profile) return null;

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Profil
        </h1>

        <div className="card p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-4xl overflow-hidden">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                ) : (
                  profile.username[0].toUpperCase()
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg transition-all disabled:opacity-50"
              >
                {uploading ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <ImageIcon size={16} />
                )}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={uploading}
              className="hidden"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Klik ikon untuk ganti foto profil
            </p>
          </div>

          {/* User Info */}
          <div className="space-y-4 border-t border-gray-100 dark:border-gray-700 pt-6">
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
              <p className="text-xs text-gray-400 mt-1">
                Username tidak bisa diubah
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Mail size={16} className="text-gray-400" />
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Email
                </label>
              </div>
              <p className="text-gray-800 dark:text-gray-200 font-medium text-sm">
                user@example.com
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <User size={16} className="text-gray-400" />
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Nama Lengkap
                </label>
              </div>
              {editing ? (
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) =>
                    setForm({ ...form, full_name: e.target.value })
                  }
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
                  onChange={(e) =>
                    setForm({ ...form, bio: e.target.value })
                  }
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
                className="btn-primary flex-1 text-sm flex items-center justify-center gap-2"
              >
                {saving && <Loader size={14} className="animate-spin" />}
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
