import { tool } from "ai";
import { Session } from "next-auth";
import { z } from "zod";

import crypto from "crypto";

// import { checkWalletBalanceApi } from "./wallet-balance-active";

import { isValidSolanaAddress } from "@/lib/utils";

interface buyTokensProps {
  session: Session;
}

export const buyTokens = ({ session }: buyTokensProps) =>
  tool({
    description:
      "Buy Tokens with Sol. First you must check the wallet balance and confirm that its grater than the buy amount + 0.2 sol. This does not submit the transactions to the network. Pops up the component so user can accept and submit the transaction",
    parameters: z.object({
      address: z.string(),
      amount: z.number(),
    }),
    execute: async ({ address, amount }) => {
      const userId = session.user?.email;
      const userEncryptionKey = deriveKey(session);

      let buyTokensResponce = "";

      if (userId && userEncryptionKey) {
        // const balanceResponce = await checkWalletBalanceApi(
        //   userId,
        //   userEncryptionKey
        // );
        // if (Number(balanceResponce.balance) < 0.11 + amount) {
        //   buyTokensResponce = `Your wallet balance is ${balanceResponce.balance} sol, which is less than 0.11 sol + buy amount. You need at least 0.11 sol + buy amount. mention about 0.11 sol, its a must`;
        //   return buyTokensResponce;
        // }

        if (!isValidSolanaAddress(address)) {
          // const response = await searchTokensBySymbol(address);
          // console.log("responce");
          // return {
          //   ...response,
          //   searchMessage: `Here are the search results for ${address}.`,
          //   warningNote:
          //     "⚠️ Please use the CA of the token for on-chain activities and detailed information about the token metadata.",
          // };

          return `could not find any tokens for ${address}. Please try using contract address of the token`;
        }

        // const responce = await buyTokensApi(
        //   userId,
        //   userEncryptionKey,
        //   address,
        //   amount
        // );

        const buyInstructions = {
          user_info: {
            userId: userId,
            userPassword: userEncryptionKey,
          },
          tokens_info: {
            buying: address,
            selling: "SOL",
            buyingAmount: amount,
          },
        };

        // buyTokensResponce = JSON.stringify(buyInstructions);
        // console.log(buyTokensResponce);
        return buyInstructions;
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
