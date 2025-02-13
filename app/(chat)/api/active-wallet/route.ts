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

    const wallets = await getActiveWalletApi(userId, userEncryptionKey);

    return NextResponse.json(wallets);
  } catch (error) {
    console.error("Error fetching wallets:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { wallet_name } = await req.json();

    if (!wallet_name) {
      return NextResponse.json(
        { error: "Wallet name is required" },
        { status: 400 }
      );
    }

    const userId = session.user?.email;
    const userEncryptionKey = deriveKey(session);

    const result = await setActiveWalletApi(
      userId,
      userEncryptionKey,
      wallet_name
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error setting active wallet:", error);
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

const getActiveWalletApi = async (userId: string, userPassword: string) => {
  try {
    const response = await fetch(
      "http://127.0.0.1:8000/wallet/getActiveWalletName",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, userPassword }),
      }
    );

    if (!response.ok) {
      return `Error: ${response.status} ${response.statusText}`;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching wallet data:", error);
    return error;
  }
};

const setActiveWalletApi = async (
  userId: string,
  userPassword: string,
  wallet_name: string
) => {
  try {
    console.log(wallet_name);

    const response = await fetch(
      "http://127.0.0.1:8000/wallet/setActiveWallet",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, userPassword, wallet_name }),
      }
    );

    if (!response.ok) {
      return `Error: ${response.status} ${response.statusText}`;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching wallets:", error);
    return error;
  }
};
