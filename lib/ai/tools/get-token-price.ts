import { tool } from "ai";
import { z } from "zod";

import "dotenv/config";

export const getCurrentTokenPrice = () =>
  tool({
    description:
      "Get current price of a token. if the CA is not provided search for the token and then get the price",
    parameters: z.object({
      address: z.string(),
    }),
    execute: async ({ address }) => {
      let priceResponse = "";

      const apiKey = process.env.SOLANATRACKER_KEY;

      if (!apiKey) {
        throw new Error(
          "API Key is missing. Please set SOLANATRACKER_KEY in your environment variables."
        );
      }

      try {
        const response = await fetch(
          `https://data.solanatracker.io/price?token=${address}`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
              "X-API-Key": apiKey,
            },
          }
        );

        if (!response.ok) {
          console.warn(`HTTP Error: ${response.status} ${response.statusText}`);
          priceResponse = `Failed to get current price for ${address}. Please try again.`;
          return priceResponse;
        }

        const data = await response.json();

        priceResponse = data;
      } catch (error) {
        console.error("Error fetching token price:", error);
        priceResponse = `Failed to get current price for ${address}. Please try again.`;
      }

      return priceResponse;
    },
  });
