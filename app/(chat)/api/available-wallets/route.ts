import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { Session } from "next-auth";
import crypto from "crypto";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user?.email;
    const userEncryptionKey = deriveKey(session);

    const wallets = await getWalletsApi(userId, userEncryptionKey);

    return NextResponse.json(wallets);
  } catch (error) {
    console.error("Error fetching wallets:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

const deriveKey = (session: Session) => {
  if (!session?.user?.email) return "User ID is required for key derivation";

  const salt = process.env.ENCRYPTION_SALT || "default-salt";
  const key = crypto.pbkdf2Sync(session.user.email, salt, 100000, 32, "sha256");

  return key.toString("hex");
};

const getWalletsApi = async (userId: string, userPassword: string) => {
  try {
    const response = await fetch("http://127.0.0.1:8000/wallet/getAllWallets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, userPassword }),
    });

    if (!response.ok) {
      return `Error: ${response.status} ${response.statusText}`;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching wallets:", error);
    return error;
  }
};
