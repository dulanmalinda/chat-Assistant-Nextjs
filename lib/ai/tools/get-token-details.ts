import { tool } from "ai";
import { z } from "zod";

import { isValidSolanaAddress } from "@/lib/utils";

import "dotenv/config";

export const getTokenDetails = () =>
  tool({
    description:
      "Get detils of a token. Only if the contract address is provided by the user",
    parameters: z.object({
      address: z.string(),
    }),
    execute: async ({ address }) => {
      if (!isValidSolanaAddress(address)) {
        // const response = await searchTokensBySymbol(address);
        // return {
        //   ...response,
        //   searchMessage: `Here are the search results for ${address}.`,
        //   warningNote:
        //     "⚠️ Please use the CA of the token for on-chain activities and detailed information about the token metadata.",
        // };

        return `could not find any tokens for ${address}. Please try using CA of the token`;
      }

      const responce = await getTokenDetailsApi(address);
      return responce;
    },
  });

const getTokenDetailsApi = async (address: string) => {
  try {
    const apiKey = process.env.SOLANATRACKER_KEY;

    if (!apiKey) {
      throw new Error(
        "API Key is missing. Please set SOLANATRACKER_KEY in your environment variables."
      );
    }

    const response = await fetch(
      `https://data.solanatracker.io/tokens/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      return `Error: ${response.status} ${response.statusText}`;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching wallets:", error);
    return error;
  }
};
