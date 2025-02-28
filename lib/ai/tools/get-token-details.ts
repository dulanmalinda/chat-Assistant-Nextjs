import { tool } from "ai";
import { z } from "zod";

import "dotenv/config";

export const getTokenDetails = () =>
  tool({
    description:
      "Get detils of a token. Must check whether the provided CA is valid before proceeding. If a CA is not provided search for the token.",
    parameters: z.object({
      address: z.string(),
    }),
    execute: async ({ address }) => {
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
    console.error("Error fetching token details:", error);
    return error;
  }
};
