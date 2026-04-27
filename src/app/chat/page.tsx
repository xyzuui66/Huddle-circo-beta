"use client";

import MainLayout from "@/components/layout/MainLayout";
import { MessageCircle } from "lucide-react";

export default function ChatPage() {
  return (
    <MainLayout>
      <div className="h-full flex flex-col items-center justify-center">
        <MessageCircle size={48} className="text-gray-300 mb-4" />
        <p className="text-gray-400 text-lg">Pilih percakapan untuk mulai chat</p>
        <p className="text-gray-300 text-sm mt-2">Fitur Direct Message akan segera hadir!</p>
      </div>
    </MainLayout>
  );
}
