import { tool } from "ai";
import { z } from "zod";

import "dotenv/config";

export const getCurrentTokenPrice = () =>
  tool({
    description:
      "Get current price of a token. Must check whether the provided CA is valid before proceeding. If a CA is not provided search for the token.",
    parameters: z.object({
      address: z.string(),
    }),
    execute: async ({ address }) => {
      let priceResponse = "";

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/token/${address}/price`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
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
