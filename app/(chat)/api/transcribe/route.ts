import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import "dotenv/config";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio");

    if (!audioFile || !(audioFile instanceof File)) {
      return NextResponse.json(
        { error: "No audio file uploaded" },
        { status: 400 }
      );
    }

    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `audio-${Date.now()}.wav`);
    const fileBuffer = await audioFile.arrayBuffer();
    await fs.promises.writeFile(tempFilePath, Buffer.from(fileBuffer));

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-1",
    });

    await fs.promises.unlink(tempFilePath);

    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    console.error("Transcription error:", error);

    const tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}.wav`);
    if (fs.existsSync(tempFilePath)) {
      await fs.promises.unlink(tempFilePath);
    }
    return NextResponse.json(
      { error: "Error transcribing audio" },
      { status: 500 }
    );
  }
}
