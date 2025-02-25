import { tool } from "ai";
import { z } from "zod";

import { Connection, PublicKey } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";

import "dotenv/config";

export const getCirculatingTokenSupply = () =>
  tool({
    description:
      "Get current supply of a token. if the CA is not provided search for the token and then get the supply",
    parameters: z.object({
      address: z.string(),
    }),
    execute: async ({ address }) => {
      let getCurrentSupplyResponce = "";

      try {
        const connection = new Connection(
          `https://rpc.shyft.to?api_key=${process.env.SHYFT_API_KEY}`,
          "confirmed"
        );
        const mintPublicKey = new PublicKey(address);
        const mintAccount = await getMint(connection, mintPublicKey);

        const supply = mintAccount.supply;
        const decimals = mintAccount.decimals;
        const formattedCurrentSupply = Number(supply) / 10 ** decimals;
        getCurrentSupplyResponce = `Current token supply of ${address} is ${formattedCurrentSupply}`;
        return getCurrentSupplyResponce;
      } catch (error) {
        getCurrentSupplyResponce = `Failed to get current supply. Try again.`;
        return getCurrentSupplyResponce;
      }
    },
  });
