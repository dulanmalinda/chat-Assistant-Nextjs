import { tool } from "ai";
import { Session } from "next-auth";
import { z } from "zod";

import "dotenv/config";

import crypto from "crypto";

import { isValidSolanaAddress } from "@/lib/utils";
import { searchTokensBySymbol } from "../search-tokens";

interface checkWalletTokenBalancesProps {
  session: Session;
}

export const checkWalletTokenBalances = ({
  session,
}: checkWalletTokenBalancesProps) =>
  tool({
    description: "Get token balances of the active wallet.",
    parameters: z.object({}),
    execute: async ({}) => {
      const userId = session.user?.email;
      const userEncryptionKey = deriveKey(session);

      let checkWalletTokenBalancesResponce = "";

      if (userId && userEncryptionKey) {
        const responce = await checkWalletTokenBalancesApi(
          userId,
          userEncryptionKey
        );
        checkWalletTokenBalancesResponce = responce;
        return checkWalletTokenBalancesResponce;
      }

      checkWalletTokenBalancesResponce = `Failed to get token balances. Try again.`;
      return checkWalletTokenBalancesResponce;
    },
  });

const deriveKey = (session: Session) => {
  if (!session?.user?.email)
    throw new Error("User ID is required for key derivation");

  const salt = process.env.ENCRYPTION_SALT || "default-salt";
  const key = crypto.pbkdf2Sync(session.user.email, salt, 100000, 32, "sha256");

  return key.toString("hex");
};

export const checkWalletTokenBalancesApi = async (
  userId: string,
  userPassword: string
) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/wallet/tokenbalances`, {
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
