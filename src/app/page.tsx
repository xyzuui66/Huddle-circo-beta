"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import Image from "next/image";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) router.replace("/global-chat");
      else router.replace("/auth/login");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <Image
          src="/icons/logo.png"
          alt="Huddle"
          width={120}
          height={120}
          className="rounded-3xl shadow-2xl"
        />
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
          Huddle
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Memuat...
        </p>
      </div>
    </div>
  );
}
