import { tool } from "ai";
import { Session } from "next-auth";
import { z } from "zod";

import crypto from "crypto";

interface checkWalletBalanceProps {
  session: Session;
}

export const checkWalletBalance = ({ session }: checkWalletBalanceProps) =>
  tool({
    description: "Get balance (SOL) of the active wallet",
    parameters: z.object({}),
    execute: async ({}) => {
      const userId = session.user?.email;
      const userEncryptionKey = deriveKey(session);

      let checkWalletBalanceResponce = "";

      if (userId && userEncryptionKey) {
        const responce = await checkWalletBalanceApi(userId, userEncryptionKey);
        checkWalletBalanceResponce = responce;
        return checkWalletBalanceResponce;
      }

      checkWalletBalanceResponce = `Failed to get wallet balance. Try again.`;
      return checkWalletBalanceResponce;
    },
  });

const deriveKey = (session: Session) => {
  if (!session?.user?.email)
    throw new Error("User ID is required for key derivation");

  const salt = process.env.ENCRYPTION_SALT || "default-salt";
  const key = crypto.pbkdf2Sync(session.user.email, salt, 100000, 32, "sha256");

  return key.toString("hex");
};

export const checkWalletBalanceApi = async (
  userId: string,
  userPassword: string
) => {
  try {
    const response = await fetch("http://127.0.0.1:8000/wallet/balance", {
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
    console.error("Error fetching wallet data:", error);
    return error;
  }
};
