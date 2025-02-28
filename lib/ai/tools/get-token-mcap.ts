import { tool } from "ai";
import { z } from "zod";

import { Connection, PublicKey } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";

import "dotenv/config";

export const getCirculatingMarketcap = () =>
  tool({
    description:
      "To get the circulating market cap of a token. responce should be in USD. Must check whether the provided CA is valid before proceeding. If a CA is not provided search for the token.",
    parameters: z.object({
      address: z.string(),
    }),
    execute: async ({ address }) => {
      let marketcapResponse: string | number = "";

      const circulatingSupply = await getCirculatingTokenSupply(address);
      const tokenPrice = await getCurrentTokenPrice(address);

      const validCirculatingSupply =
        circulatingSupply > 0 ? circulatingSupply : 0;
      const validTokenPrice = tokenPrice > 0 ? tokenPrice : 0;

      const marketcap = validCirculatingSupply * validTokenPrice;

      if (marketcap > 0) {
        marketcapResponse = marketcap;
        //marketcapResponse = `The circulating market cap of ${address} is ${marketcap.toLocaleString()} USD`;
      } else {
        marketcapResponse = `Could not determine the circulating market cap for ${address}.`;
      }

      return marketcapResponse;
    },
  });

const getCirculatingTokenSupply = async (address: string): Promise<number> => {
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

    return formattedCurrentSupply;
  } catch (error) {
    return 0;
  }
};

const getCurrentTokenPrice = async (address: string): Promise<number> => {
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
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.usdPrice;
  } catch (error) {
    return 0;
  }
};
