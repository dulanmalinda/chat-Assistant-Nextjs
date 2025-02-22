import { tool } from "ai";
import { Session } from "next-auth";
import { z } from "zod";

import crypto from "crypto";

interface checkWalletBalancesProps {
  session: Session;
}

export const checkWalletBalances = ({ session }: checkWalletBalancesProps) =>
  tool({
    description: "To get wallet balances of all wallets",
    parameters: z.object({}),
    execute: async ({}) => {
      const userId = session.user?.email;
      const userEncryptionKey = deriveKey(session);

      let checkWalletBalancesResponce = "";

      if (userId && userEncryptionKey) {
        const responce = await checkWalletBalancesApi(
          userId,
          userEncryptionKey
        );
        checkWalletBalancesResponce = responce;
        return checkWalletBalancesResponce;
      }

      checkWalletBalancesResponce = `Failed to get wallet balances. Try again.`;
      return checkWalletBalancesResponce;
    },
  });

const deriveKey = (session: Session) => {
  if (!session?.user?.email)
    throw new Error("User ID is required for key derivation");

  const salt = process.env.ENCRYPTION_SALT || "default-salt";
  const key = crypto.pbkdf2Sync(session.user.email, salt, 100000, 32, "sha256");

  return key.toString("hex");
};

export const checkWalletBalancesApi = async (
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
