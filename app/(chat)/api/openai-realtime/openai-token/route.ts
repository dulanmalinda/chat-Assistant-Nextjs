import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Request a WebRTC session from OpenAI
    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2024-12-17",
          voice: "alloy",
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error getting OpenAI token:", error);
    return NextResponse.json(
      { error: "Failed to get OpenAI token" },
      { status: 500 }
    );
  }
}
