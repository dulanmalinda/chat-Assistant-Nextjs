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
      "Sell Tokens. First you must check whether the wallet has sufficient tokens to sell.",
    parameters: z.object({
      address: z.string(),
      amount: z.number(),
    }),
    execute: async ({ address, amount }) => {
      const userId = session.user?.email;
      const userEncryptionKey = deriveKey(session);

      console.log("selll sdsds");

      let sellTokensResponce = "";

      if (userId && userEncryptionKey) {
        if (!isValidSolanaAddress(address)) {
          // const response = await searchTokensBySymbol(address);
          // return {
          //   ...response,
          //   searchMessage: `Here are the search results for ${address}.`,
          //   warningNote:
          //     "⚠️ Please use the CA of the token for on-chain activities and detailed information about the token metadata.",
          // };

          return `could not find any tokens for ${address}. Please try using contract address of the token`;
        }

        const responce = await sellTokensApi(
          userId,
          userEncryptionKey,
          address,
          amount
        );
        sellTokensResponce = responce;
        return sellTokensResponce;
      }

      sellTokensResponce = `Failed to sell tokens. Try again.`;
      return sellTokensResponce;
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
