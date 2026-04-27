"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

interface UploadOptions {
  bucket: string;
  folder?: string;
  maxSize?: number;
}

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function uploadFile(
    file: File,
    options: UploadOptions
  ): Promise<string | null> {
    setUploading(true);
    setProgress(0);

    try {
      if (options.maxSize && file.size > options.maxSize) {
        const maxMB = (options.maxSize / 1024 / 1024).toFixed(1);
        toast.error(`File terlalu besar! Max ${maxMB}MB`);
        setUploading(false);
        return null;
      }

      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const ext = file.name.split(".").pop();
      const filename = `${timestamp}-${random}.${ext}`;
      const path = options.folder ? `${options.folder}/${filename}` : filename;

      const { data, error } = await supabase.storage
        .from(options.bucket)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        toast.error("Gagal upload file!");
        console.error("Upload error:", error);
        setUploading(false);
        return null;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(options.bucket).getPublicUrl(data.path);

      setProgress(100);
      setUploading(false);
      return publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Gagal upload file!");
      setUploading(false);
      return null;
    }
  }

  async function uploadMultiple(
    files: File[],
    options: UploadOptions
  ): Promise<string[]> {
    const urls: string[] = [];

    for (const file of files) {
      const url = await uploadFile(file, options);
      if (url) urls.push(url);
      setProgress((urls.length / files.length) * 100);
    }

    return urls;
  }

  async function recordVoiceMessage(): Promise<string | null> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const file = new File([blob], `voice-${Date.now()}.webm`, {
          type: "audio/webm",
        });

        const url = await uploadFile(file, {
          bucket: "voice-messages",
          maxSize: 5 * 1024 * 1024,
        });

        stream.getTracks().forEach((track) => track.stop());
        return url;
      };

      mediaRecorder.start();
      return new Promise((resolve) => {
        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunks, { type: "audio/webm" });
          const file = new File([blob], `voice-${Date.now()}.webm`, {
            type: "audio/webm",
          });
          const url = await uploadFile(file, {
            bucket: "voice-messages",
            maxSize: 5 * 1024 * 1024,
          });
          stream.getTracks().forEach((track) => track.stop());
          resolve(url);
        };
      });
    } catch (error) {
      toast.error("Gagal akses mikrofon!");
      return null;
    }
  }

  async function deleteFile(bucket: string, path: string) {
    try {
      await supabase.storage.from(bucket).remove([path]);
      toast.success("File berhasil dihapus!");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Gagal hapus file!");
    }
  }

  return {
    uploadFile,
    uploadMultiple,
    recordVoiceMessage,
    deleteFile,
    uploading,
    progress,
  };
}
