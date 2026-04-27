"use client";

import MainLayout from "@/components/layout/MainLayout";
import { Radio } from "lucide-react";

export default function ChannelsPage() {
  return (
    <MainLayout>
      <div className="h-full flex flex-col items-center justify-center">
        <Radio size={48} className="text-gray-300 mb-4" />
        <p className="text-gray-400 text-lg">Belum ada saluran</p>
        <p className="text-gray-300 text-sm mt-2">Buat saluran broadcast kamu sekarang!</p>
      </div>
    </MainLayout>
  );
}
