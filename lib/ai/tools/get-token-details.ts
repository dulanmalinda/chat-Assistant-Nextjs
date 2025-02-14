import { tool } from "ai";
import { z } from "zod";

export const getTokenDetails = () =>
  tool({
    description: "To get detils of a token",
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
    console.error("Error fetching wallets:", error);
    return error;
  }
};
