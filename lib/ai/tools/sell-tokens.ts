import { tool } from "ai";
import { Session } from "next-auth";
import { z } from "zod";

import crypto from "crypto";

import { isValidSolanaAddress } from "@/lib/utils";

interface sellTokensProps {
  session: Session;
}

export const sellTokens = ({ session }: sellTokensProps) =>
  tool({
    description:
      "Sell Tokens. This does not submit the transactions to the network. Pops up the component so user can accept and submit the transaction",
    parameters: z.object({
      tokenAddress: z.string(),
      amount: z.number(),
    }),
    execute: async ({ tokenAddress, amount }) => {
      const userId = session.user?.email;
      const userEncryptionKey = deriveKey(session);

      const sellInstructions = {
        tokens_info: {
          buying: "SOL",
          selling: tokenAddress,
          sellingAmount: amount,
        },
      };

      return sellInstructions;
    },
  });

const deriveKey = (session: Session) => {
  if (!session?.user?.email)
    throw new Error("User ID is required for key derivation");

  const salt = process.env.ENCRYPTION_SALT || "default-salt";
  const key = crypto.pbkdf2Sync(session.user.email, salt, 100000, 32, "sha256");

  return key.toString("hex");
};

const sellTokensApi = async (
  userId: string,
  userPassword: string,
  address: string,
  amount: number
) => {
  try {
    const response = await fetch("http://127.0.0.1:8000/sell", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address,
        amount,
        userId,
        userPassword,
      }),
    });

    if (!response.ok) {
      return `Error: ${response.status} ${response.statusText}`;
    }

    return await response.json();
  } catch (error) {
    console.error("Error selling tokens:", error);
    return error;
  }
};
