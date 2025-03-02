import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { Session } from "next-auth";

import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user?.email;
    const userEncryptionKey = deriveKey(session);

    const { instructions } = await req.json();

    const apiResponse = await fetch("http://127.0.0.1:8000/buy/instructions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        userPassword: userEncryptionKey,
        instructions: instructions,
      }),
    });

    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

const deriveKey = (session: Session) => {
  if (!session?.user?.email)
    throw new Error("User ID is required for key derivation");

  const salt = process.env.ENCRYPTION_SALT || "default-salt";
  const key = crypto.pbkdf2Sync(session.user.email, salt, 100000, 32, "sha256");

  return key.toString("hex");
};
