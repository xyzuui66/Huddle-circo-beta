"use client";

import { useState, useEffect, useRef } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { useFileUpload } from "@/hooks/useFileUpload";
import type { Story } from "@/types";
import {
  Plus,
  Upload,
  X,
  Image as ImageIcon,
  Video as VideoIcon,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

export default function StoriesPage() {
  const { user, profile } = useAuth();
  const { uploadFile, uploading } = useFileUpload();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchStories();
  }, []);

  async function fetchStories() {
    const now = new Date();
    const { data } = await supabase
      .from("stories")
      .select("*, profile:profiles(*)")
      .gt("expires_at", now.toISOString())
      .order("created_at", { ascending: false });

    if (data) {
      setStories(data as Story[]);
    }
    setLoading(false);
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      toast.error("Hanya foto atau video yang didukung!");
      return;
    }

    const type = isImage ? "image" : "video";
    const maxSize = isImage ? 10 * 1024 * 1024 : 50 * 1024 * 1024; // 10MB untuk image, 50MB untuk video

    if (file.size > maxSize) {
      toast.error(
        `File terlalu besar! Max ${isImage ? 10 : 50}MB untuk ${type}`
      );
      return;
    }

    try {
      toast.loading("Uploading cerita...");

      const url = await uploadFile(file, {
        bucket: "stories",
        folder: `${user.id}`,
        maxSize,
      });

      if (!url) return;

      // Create story in database
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // Expire in 24 hours

      const { error } = await supabase.from("stories").insert({
        user_id: user.id,
        media_url: url,
        media_type: type,
        expires_at: expiresAt.toISOString(),
      });

      if (error) {
        toast.error("Gagal membuat story!");
        return;
      }

      toast.success("Story berhasil diupload!");
      setShowUpload(false);
      fetchStories();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Gagal upload story!");
    }
  }

  function getInitial(name?: string | null) {
    return name?.[0]?.toUpperCase() || "?";
  }

  if (selectedStory) {
    return (
      <MainLayout>
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl">
            {/* Close Button */}
            <button
              onClick={() => setSelectedStory(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X size={32} />
            </button>

            {/* Story Content */}
            <div className="bg-black rounded-2xl overflow-hidden">
              {selectedStory.media_type === "image" ? (
                <img
                  src={selectedStory.media_url}
                  alt="Story"
                  className="w-full h-[600px] object-contain"
                />
              ) : (
                <video
                  src={selectedStory.media_url}
                  className="w-full h-[600px] object-contain"
                  controls
                  autoPlay
                />
              )}
            </div>

            {/* Story Info */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  {selectedStory.profile?.avatar_url ? (
                    <img
                      src={selectedStory.profile.avatar_url}
                      className="w-full h-full rounded-full object-cover"
                      alt=""
                    />
                  ) : (
                    getInitial(selectedStory.profile?.username)
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {selectedStory.profile?.username || "User"}
                  </p>
                  <p className="text-xs text-gray-300">
                    {formatDistanceToNow(new Date(selectedStory.created_at), {
                      addSuffix: true,
                      locale: id,
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full">
                <Eye size={14} />
                <span className="text-xs">{selectedStory.views_count}</span>
              </div>
            </div>

            {/* Expires At */}
            <p className="text-center text-gray-400 text-xs mt-4">
              Hilang dalam{" "}
              {formatDistanceToNow(new Date(selectedStory.expires_at), {
                locale: id,
              })}
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cerita
          </h1>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="btn-primary flex items-center gap-2 py-2 px-4 text-sm"
          >
            <Plus size={16} />
            Cerita Baru
          </button>
        </div>

        {/* Upload Section */}
        {showUpload && (
          <div className="card p-6 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Upload Cerita Baru
            </h3>

            <div className="space-y-4">
              {/* Media Type Selector */}
              <div className="flex gap-2">
                <button
                  onClick={() => setMediaType("image")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                    mediaType === "image"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600"
                      : "border-gray-200 dark:border-gray-700 text-gray-500"
                  }`}
                >
                  <ImageIcon size={16} />
                  Foto
                </button>
                <button
                  onClick={() => setMediaType("video")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                    mediaType === "video"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600"
                      : "border-gray-200 dark:border-gray-700 text-gray-500"
                  }`}
                >
                  <VideoIcon size={16} />
                  Video
                </button>
              </div>

              {/* Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              >
                <Upload
                  size={32}
                  className="mx-auto mb-3 text-gray-400"
                />
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Klik atau drag {mediaType === "image" ? "foto" : "video"}
                </p>
                <p className="text-gray-400 text-sm">
                  Max {mediaType === "image" ? "10MB" : "50MB"} •{" "}
                  {mediaType === "image" ? "JPG, PNG" : "MP4, WebM"}
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept={
                  mediaType === "image" ? "image/*" : "video/*"
                }
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setShowUpload(false)}
                  className="btn-ghost flex-1 text-sm"
                >
                  Batal
                </button>
                {uploading && (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-sm text-gray-400">Uploading...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stories Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Memuat...</div>
        ) : stories.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            Belum ada cerita. Upload cerita pertama kamu!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {stories.map((story) => (
              <div
                key={story.id}
                onClick={() => setSelectedStory(story)}
                className="group cursor-pointer relative rounded-2xl overflow-hidden aspect-[9/16] bg-gray-200 dark:bg-gray-700 hover:ring-2 hover:ring-blue-500 transition-all"
              >
                {story.media_type === "image" ? (
                  <img
                    src={story.media_url}
                    alt="Story"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <>
                    <video
                      src={story.media_url}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <VideoIcon
                        size={32}
                        className="text-white"
                      />
                    </div>
                  </>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                      {story.profile?.username?.[0]?.toUpperCase() || "?"}
                    </div>
                    <span className="text-white text-xs font-medium truncate">
                      {story.profile?.username}
                    </span>
                  </div>
                </div>

                {/* Views Badge */}
                <div className="absolute top-2 right-2 bg-black/40 text-white px-2 py-1 rounded-full text-[10px] font-medium flex items-center gap-1">
                  <Eye size={10} />
                  {story.views_count}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
