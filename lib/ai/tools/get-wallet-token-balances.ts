import { tool } from "ai";
import { Session } from "next-auth";
import { z } from "zod";

import "dotenv/config";

import crypto from "crypto";

import { isValidSolanaAddress } from "@/lib/utils";
import { searchTokensBySymbol } from "../search-tokens";

export const checkWalletTokenBalances = () =>
  tool({
    description: "Get token balances of my wallet (in my active wallet)",
    parameters: z.object({
      tokenAddress: z.string(),
    }),
    execute: async ({ tokenAddress }) => {
      let checkWalletTokenBalancesResponce = "";

      if (!isValidSolanaAddress(tokenAddress)) {
        const response = await searchTokensBySymbol(tokenAddress);
        return {
          ...response,
          searchMessage: `Here are the search results for ${tokenAddress}.`,
          warningNote:
            "⚠️ Please use the CA of the token for on-chain activities and detailed information about the token metadata.",
        };
      }

      const responce = await checkWalletTokenBalancesApi(tokenAddress);

      checkWalletTokenBalancesResponce = responce;
      return responce;
    },
  });

export const checkWalletTokenBalancesApi = async (tokenAddress: string) => {
  try {
    const response = await fetch(
      `https://solana-gateway.moralis.io/account/mainnet/${tokenAddress}/tokens`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          "X-API-Key": process.env.MORALIS_API_KEY as string,
        },
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
