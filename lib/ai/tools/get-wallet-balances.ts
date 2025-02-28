import { tool } from "ai";
import { Session } from "next-auth";
import { z } from "zod";

import "dotenv/config";

import crypto from "crypto";

import axios from "axios";

import { isValidSolanaAddress } from "@/lib/utils";

export const checkWalletBalances = () =>
  tool({
    description:
      "Get token balances of wallet/wallets. First you must get the address/addresses of the mentioned wallet/wallets. If not use the address of the active wallet. (Make sure you get the wallet addresses correctly.)",
    parameters: z.object({
      walletAddresses: z.array(z.string()),
    }),
    execute: async ({ walletAddresses }) => {
      const responce = await checkWalletBalancesApi(walletAddresses);

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

export const checkWalletBalancesApi = async (walletAddresses: string[]) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/wallets/balances`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ wallets: walletAddresses }),
    });

    if (!response.ok) {
      console.warn(`Error: ${response.status} ${response.statusText}`);
      return response.statusText;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching wallet balances:`, error);
    return error;
  }
};
