import { tool } from "ai";
import { z } from "zod";

import { isValidSolanaAddress } from "@/lib/utils";

import "dotenv/config";

export const searchTokens = () =>
  tool({
    description:
      "Search for tokens by symbol, name, or ticker. Always display the search list and do not proceed with any further actions until the user explicitly selects a token.",
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
    const response = await fetch(
      `http://127.0.0.1:8000/tokens/${search_param}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return `Error: ${response.status} ${response.statusText}`;
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching wallets:", error);
    return error;
  }
};
