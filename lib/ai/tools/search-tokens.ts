import { tool } from "ai";
import { z } from "zod";

import { isValidSolanaAddress } from "@/lib/utils";

import "dotenv/config";

export const searchTokens = () =>
  tool({
    description: "Search for tokens with symbol, name, or address.",
    parameters: z.object({
      search_param: z.string(),
    }),
    execute: async ({ search_param }) => {
      const responce = await searchTokensApi(search_param);
      return responce;
    },
  });

const searchTokensApi = async (search_param: string) => {
  try {
    const apiKey = process.env.SOLANATRACKER_KEY;

    if (!apiKey) {
      throw new Error(
        "API Key is missing. Please set SOLANATRACKER_KEY in your environment variables."
      );
    }

    // console.log(
    //   `https://data.solanatracker.io/search?query=${search_param}&limit=10&page=1`
    // );

    const response = await fetch(
      `https://data.solanatracker.io/search?query=${search_param}&limit=10&page=1`,
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
