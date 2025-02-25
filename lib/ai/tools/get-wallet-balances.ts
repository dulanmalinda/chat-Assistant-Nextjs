import { tool } from "ai";
import { Session } from "next-auth";
import { z } from "zod";

import "dotenv/config";

import crypto from "crypto";

import { isValidSolanaAddress } from "@/lib/utils";

export const checkWalletBalances = () =>
  tool({
    description:
      "Get token balances of wallet/wallets. First you must get the address/addresses of the mentioned wallet/wallets. If not use the address of the active wallet. If there are multiple wallets, should get the balances for all",
    parameters: z.object({
      walletAddress: z.string(),
    }),
    execute: async ({ walletAddress }) => {
      // const userId = session.user?.email;
      // const userEncryptionKey = deriveKey(session);

      // if (userId && userEncryptionKey) {
      //   const responce = await checkWalletTokenBalancesApi(
      //     userId,
      //     userEncryptionKey
      //   );
      //   checkWalletTokenBalancesResponce = responce;
      //   return checkWalletTokenBalancesResponce;
      // }

      const responce = await checkWalletBalancesApi(walletAddress);

      return responce;
    },
  });

const deriveKey = (session: Session) => {
  if (!session?.user?.email)
    throw new Error("User ID is required for key derivation");

  const salt = process.env.ENCRYPTION_SALT || "default-salt";
  const key = crypto.pbkdf2Sync(session.user.email, salt, 100000, 32, "sha256");

  return key.toString("hex");
};

export const checkWalletBalancesApi = async (walletAddress: string) => {
  try {
    const apiKey = process.env.SOLANATRACKER_KEY;

    if (!apiKey) {
      throw new Error(
        "API Key is missing. Please set SOLANATRACKER_KEY in your environment variables."
      );
    }

    const response = await fetch(
      `https://data.solanatracker.io/wallet/${walletAddress}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        // body: JSON.stringify({ userId, userPassword }),
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
