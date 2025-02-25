import { tool } from "ai";
import { Session } from "next-auth";
import { z } from "zod";

import crypto from "crypto";

import { isValidSolanaAddress } from "@/lib/utils";

interface transferSolProps {
  session: Session;
}

export const transferTokens = ({ session }: transferSolProps) =>
  tool({
    description:
      "Transfer Tokens. Proceed only if token balance of the wallet is greater than transfer amount",
    parameters: z.object({
      to_address: z.string(),
      amount: z.number(),
      mint_address: z.string(),
    }),
    execute: async ({ to_address, amount, mint_address }) => {
      const userId = session.user?.email;
      const userEncryptionKey = deriveKey(session);

      let transferTokensResponce = "";

      if (userId && userEncryptionKey) {
        if (!isValidSolanaAddress(mint_address)) {
          // const response = await searchTokensBySymbol(mint_address);
          // return {
          //   ...response,
          //   searchMessage: `Here are the search results for ${mint_address}.`,
          //   warningNote:
          //     "⚠️ Please use the CA of the token for on-chain activities and detailed information about the token metadata.",
          // };

          return `could not find any tokens for ${mint_address}. Please try using contract address of the token`;
        }
        const responce = await transferTokensApi(
          userId,
          userEncryptionKey,
          to_address,
          amount,
          mint_address
        );
        transferTokensResponce = responce;
        return transferTokensResponce;
      }

      transferTokensResponce = `Failed to transfer tokens. Try again.`;
      return transferTokensResponce;
    },
  });

const deriveKey = (session: Session) => {
  if (!session?.user?.email)
    throw new Error("User ID is required for key derivation");

  const salt = process.env.ENCRYPTION_SALT || "default-salt";
  const key = crypto.pbkdf2Sync(session.user.email, salt, 100000, 32, "sha256");

  return key.toString("hex");
};

const transferTokensApi = async (
  userId: string,
  userPassword: string,
  to_address: string,
  amount: number,
  mint_address: string
) => {
  try {
    const response = await fetch("http://127.0.0.1:8000/transfer/spl", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to_address,
        amount,
        mint_address,
        userId,
        userPassword,
      }),
    });

    if (!response.ok) {
      return `Error: ${response.status} ${response.statusText}`;
    }

    return await response.json();
  } catch (error) {
    console.error("Error transfering tokens:", error);
    return error;
  }
};
