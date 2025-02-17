import { tool } from "ai";
import { z } from "zod";

import { isValidSolanaAddress } from "@/lib/utils";
import { searchTokensBySymbol } from "../search-tokens";

export const getTokenDetails = () =>
  tool({
    description: "To get detils of a token",
    parameters: z.object({
      address: z.string(),
    }),
    execute: async ({ address }) => {
      if (!isValidSolanaAddress(address)) {
        const response = await searchTokensBySymbol(address);
        return {
          ...response,
          searchMessage: `Here are the search results for ${address}.`,
          warningNote:
            "⚠️ Please use the CA of the token for on-chain activities and detailed information about the token metadata.",
        };
      }

      const responce = await getTokenDetailsApi(address);
      return responce;
    },
  });

const getTokenDetailsApi = async (address: string) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/token/${address}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return `Error: ${response.status} ${response.statusText}`;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching wallets:", error);
    return error;
  }
};
