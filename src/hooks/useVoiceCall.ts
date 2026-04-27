"use client";

import { useEffect, useRef, useState } from "react";
import DailyIframe from "@daily-co/daily-js";
import type DailyType from "@daily-co/daily-js";
import toast from "react-hot-toast";

interface UseVoiceCallProps {
  onClose?: () => void;
}

export function useVoiceCall({ onClose }: UseVoiceCallProps) {
  const callFrameRef = useRef<DailyType.DailyCall | null>(null);
  const [callState, setCallState] = useState<string>("idle");
  const [participants, setParticipants] = useState(0);
  const [roomUrl, setRoomUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  // CREATE ROOM DI DAILY.CO
  async function createDailyRoom(): Promise<string | null> {
    try {
      const response = await fetch("/api/daily/create-room", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Gagal membuat room");
      }

      const data = await response.json();
      return data.url;
    } catch (err) {
      console.error("Error creating room:", err);
      toast.error("Gagal membuat room panggilan!");
      return null;
    }
  }

  // JOIN ROOM
  async function joinRoom(url: string) {
    try {
      const callFrame = DailyIframe.createCallFrame({
        iframeStyle: {
          position: "absolute",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
        },
      });

      callFrame
        .on("joined-meeting", () => {
          setCallState("joined");
          toast.success("Terhubung ke panggilan!");
        })
        .on("left-meeting", () => {
          setCallState("idle");
          onClose?.();
        })
        .on("error", (error) => {
          console.error("Call error:", error);
          setError("Error: " + error.toString());
          toast.error("Terjadi error di panggilan!");
        });

      await callFrame.join({ url });
      callFrameRef.current = callFrame;
      setRoomUrl(url);
    } catch (err) {
      console.error("Join error:", err);
      setError("Gagal join room!");
      toast.error("Gagal bergabung ke panggilan!");
    }
  }

  const leaveCall = async () => {
    if (callFrameRef.current) {
      await callFrameRef.current.leave();
      callFrameRef.current.destroy();
      callFrameRef.current = null;
    }
  };

  const toggleAudio = async (enabled: boolean) => {
    if (callFrameRef.current) {
      await callFrameRef.current.setLocalAudio(enabled);
    }
  };

  const toggleVideo = async (enabled: boolean) => {
    if (callFrameRef.current) {
      await callFrameRef.current.setLocalVideo(enabled);
    }
  };

  return {
    callState,
    participants,
    roomUrl,
    error,
    createDailyRoom,
    joinRoom,
    leaveCall,
    toggleAudio,
    toggleVideo,
    callFrameRef,
  };
}
