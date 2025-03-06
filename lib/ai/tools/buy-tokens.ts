import { tool } from "ai";
import { Session } from "next-auth";
import { z } from "zod";

import crypto from "crypto";

import { checkWalletBalancesApi } from "./get-wallet-balances";

import { isValidSolanaAddress } from "@/lib/utils";

export const buyTokens = () =>
  tool({
    description:
      "Buy Tokens with Sol. **If walletBalance is less than (0.2 + amount): do not execute**. This does not submit the transactions to the network. Pops up the component so user can accept and submit the transaction",
    parameters: z.object({
      tokenAddress: z.string(),
      amount: z.number(),
      walletBalance: z.number(),
    }),
    execute: async ({ tokenAddress, amount, walletBalance }) => {
      console.log(walletBalance);

      const buyInstructions = {
        tokens_info: {
          buying: tokenAddress,
          selling: "SOL",
          buyingAmount: amount,
        },
      };

      return buyInstructions;
    },
  });

const deriveKey = (session: Session) => {
  if (!session?.user?.email)
    throw new Error("User ID is required for key derivation");

  const salt = process.env.ENCRYPTION_SALT || "default-salt";
  const key = crypto.pbkdf2Sync(session.user.email, salt, 100000, 32, "sha256");

  return key.toString("hex");
};

const buyTokensApi = async (
  userId: string,
  userPassword: string,
  address: string,
  amount: number
) => {
  try {
    const response = await fetch("http://127.0.0.1:8000/buy/info", {
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

    const data = await response.json();

    const buyInstructions = {
      ...data,
      user_info: {
        userId: userId,
        userPassword: userPassword,
      },
      tokens_inf0: {
        buying: address,
        selling: "SOL",
        buyingAmount: amount,
      },
    };

    console.log(JSON.stringify(buyInstructions, null, 2));

    return buyInstructions;
  } catch (error) {
    console.error("Error buying tokens:", error);
    return error;
  }
};
