import { tool } from "ai";
import { z } from "zod";

import "dotenv/config";

export const getCurrentTokenPrice = () =>
  tool({
    description: "To get the current price of a token",
    parameters: z.object({
      address: z.string(),
    }),
    execute: async ({ address }) => {
      let priceResponse = "";

      try {
        const response = await fetch(
          `https://solana-gateway.moralis.io/token/mainnet/${address}/price`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
              "X-API-Key": process.env.MORALIS_API_KEY as string,
            },
          }
        );

        if (!response.ok) {
          console.warn(`HTTP Error: ${response.status} ${response.statusText}`);
          priceResponse = `Failed to get current price for ${address}. Please try again.`;
          return priceResponse;
        }

        const data = await response.json();
        const price = data?.usdPrice ?? 0;

        priceResponse =
          price > 0
            ? `Current token price of ${address} is ${price} USD`
            : `Token price not available or invalid for ${address}.`;
      } catch (error) {
        console.error("Error fetching token price:", error);
        priceResponse = `Failed to get current price for ${address}. Please try again.`;
      }

      return priceResponse;
    },
  });
