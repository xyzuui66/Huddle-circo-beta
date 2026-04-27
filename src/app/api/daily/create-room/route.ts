import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.DAILY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Daily API key not configured" },
        { status: 500 }
      );
    }

    // Create room di Daily.co
    const response = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          exp: Math.floor(Date.now() / 1000) + 3600, // Expire dalam 1 jam
          max_participants: 100,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Daily.co error:", data);
      return NextResponse.json(
        { error: "Gagal membuat room" },
        { status: response.status }
      );
    }

    return NextResponse.json({ url: data.url });
  } catch (error) {
    console.error("Room creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
