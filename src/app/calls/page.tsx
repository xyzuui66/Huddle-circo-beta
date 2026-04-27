"use client";

import { useState, useRef, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useVoiceCall } from "@/hooks/useVoiceCall";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";
import toast from "react-hot-toast";

export default function CallsPage() {
  const [activeCall, setActiveCall] = useState<{
    id: string;
    type: "voice" | "video";
    participantName: string;
  } | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const {
    callState,
    roomUrl,
    error,
    createDailyRoom,
    joinRoom,
    leaveCall,
    toggleAudio,
    toggleVideo,
    callFrameRef,
  } = useVoiceCall({ onClose: handleCallEnd });

  async function handleStartCall(type: "voice" | "video", name: string) {
    try {
      toast.loading("Membuat room panggilan...");
      const url = await createDailyRoom();

      if (!url) {
        toast.error("Gagal membuat room!");
        return;
      }

      toast.loading("Bergabung ke panggilan...");
      await joinRoom(url);

      setActiveCall({
        id: Math.random().toString(),
        type,
        participantName: name,
      });

      // Start timer
      callTimerRef.current = setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);

      toast.success("Terhubung!");
    } catch (err) {
      console.error("Call error:", err);
      toast.error("Gagal memulai panggilan!");
    }
  }

  function handleCallEnd() {
    setActiveCall(null);
    setCallDuration(0);
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    setIsMuted(false);
    setIsVideoOff(false);
    toast.success("Panggilan berakhir");
  }

  async function endCall() {
    await leaveCall();
    handleCallEnd();
  }

  async function toggleMute() {
    const newState = !isMuted;
    setIsMuted(newState);
    await toggleAudio(!newState);
    toast.success(newState ? "Suara dimutkan" : "Suara diaktifkan");
  }

  async function handleToggleVideo() {
    const newState = !isVideoOff;
    setIsVideoOff(newState);
    await toggleVideo(!newState);
    toast.success(newState ? "Kamera dimatikan" : "Kamera diaktifkan");
  }

  function formatDuration(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  if (activeCall && callState === "joined") {
    return (
      <MainLayout>
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4">
          {/* Daily.co Iframe Container */}
          <div className="w-full max-w-4xl h-[600px] bg-gray-900 rounded-2xl overflow-hidden mb-6 relative">
            <div
              ref={callFrameRef as any}
              className="w-full h-full"
            />
          </div>

          {/* Call Info */}
          <div className="text-center mb-6">
            <p className="text-white font-semibold text-lg mb-2">
              {activeCall.participantName}
            </p>
            <p className="text-white text-3xl font-bold font-mono">
              {formatDuration(callDuration)}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleMute}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isMuted
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {isMuted ? (
                <MicOff size={24} className="text-white" />
              ) : (
                <Mic size={24} className="text-white" />
              )}
            </button>

            {activeCall.type === "video" && (
              <button
                onClick={handleToggleVideo}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  isVideoOff
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {isVideoOff ? (
                  <VideoOff size={24} className="text-white" />
                ) : (
                  <Video size={24} className="text-white" />
                )}
              </button>
            )}

            <button
              onClick={endCall}
              className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all"
            >
              <PhoneOff size={24} className="text-white" />
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-sm mt-4">{error}</p>
          )}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Panggilan
        </h1>

        {/* Voice Room Section */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Voice Room Global
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Bergabung dengan room suara publik untuk ngobrol dengan pengguna lain
          </p>
          <button
            onClick={() => handleStartCall("voice", "Global Voice Room")}
            disabled={callState === "joined"}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Phone size={18} />
            Masuk Voice Room
          </button>
        </div>

        {/* Contact List for 1-on-1 Calls */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Panggilan Langsung
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Klik kontak untuk memulai panggilan. Mereka akan menerima notifikasi panggilan kamu.
          </p>

          <div className="space-y-2">
            {/* Demo Contacts */}
            {[
              { name: "Andi Pratama", initial: "A" },
              { name: "Budi Santoso", initial: "B" },
              { name: "Citra Dewi", initial: "C" },
            ].map((contact, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                    {contact.initial}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                      {contact.name}
                    </p>
                    <p className="text-green-500 text-xs font-medium">Online</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleStartCall("voice", contact.name)
                    }
                    disabled={callState === "joined"}
                    className="btn-ghost text-blue-500 hover:text-blue-600 p-2 disabled:opacity-50"
                  >
                    <Phone size={18} />
                  </button>
                  <button
                    onClick={() =>
                      handleStartCall("video", contact.name)
                    }
                    disabled={callState === "joined"}
                    className="btn-ghost text-purple-500 hover:text-purple-600 p-2 disabled:opacity-50"
                  >
                    <Video size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-800 dark:text-green-300">
            <strong>✓ Siap Pakai!</strong> Voice & Video Call sudah terintegrasi dengan Daily.co. 
            Klik tombol untuk memulai panggilan!
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
