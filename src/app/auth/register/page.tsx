"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock, User, AtSign } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
    fullName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Check username availability
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", form.username)
      .single();

    if (existing) {
      toast.error("Username sudah dipakai!");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (error) {
      toast.error("Gagal mendaftar: " + error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        username: form.username,
        full_name: form.fullName,
        is_online: true,
      });

      toast.success("Akun berhasil dibuat!");
      router.replace("/global-chat");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/icons/logo.png"
            alt="Huddle"
            width={80}
            height={80}
            className="rounded-2xl shadow-lg mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Huddle
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Buat akun gratis sekarang!
          </p>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
            Buat akun baru
          </h2>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative">
              <User
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                name="fullName"
                placeholder="Nama Lengkap"
                value={form.fullName}
                onChange={handleChange}
                className="input pl-10"
                required
              />
            </div>

            <div className="relative">
              <AtSign
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                name="username"
                placeholder="Username (tanpa spasi)"
                value={form.username}
                onChange={handleChange}
                className="input pl-10"
                pattern="[a-zA-Z0-9_]+"
                required
              />
            </div>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="input pl-10"
                required
              />
            </div>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Kata Sandi (min. 6 karakter)"
                value={form.password}
                onChange={handleChange}
                className="input pl-10 pr-10"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? "Membuat akun..." : "Daftar Sekarang"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Sudah punya akun?{" "}
            <Link
              href="/auth/login"
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              Masuk sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
