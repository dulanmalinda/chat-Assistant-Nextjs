import { tool } from "ai";
import { Session } from "next-auth";
import { z } from "zod";

import crypto from "crypto";

import { checkWalletBalanceApi } from "./wallet-balance";

interface buyTokensProps {
  session: Session;
}

export const buyTokens = ({ session }: buyTokensProps) =>
  tool({
    description: "To buy Tokens",
    parameters: z.object({
      address: z.string(),
      amount: z.number(),
    }),
    execute: async ({ address, amount }) => {
      const userId = session.user?.email;
      const userEncryptionKey = deriveKey(session);

      let buyTokensResponce = "";

      if (userId && userEncryptionKey) {
        const balanceResponce = await checkWalletBalanceApi(
          userId,
          userEncryptionKey
        );
        if (Number(balanceResponce.balance) < 0.11) {
          buyTokensResponce = `Your wallet balance is ${balanceResponce.balance} sol, which is less than 0.11 sol + buy amount. You need at least 0.11 sol + buy amount.`;
          return buyTokensResponce;
        }

        const responce = await buyTokensApi(
          userId,
          userEncryptionKey,
          address,
          amount
        );
        buyTokensResponce = responce;
        return buyTokensResponce;
      }

      buyTokensResponce = `Failed to buy tokens. Try again.`;
      return buyTokensResponce;
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
    const response = await fetch("http://127.0.0.1:8000/buy", {
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
    console.error("Error buying tokens:", error);
    return error;
  }
};
