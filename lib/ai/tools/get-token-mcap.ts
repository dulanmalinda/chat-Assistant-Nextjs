import { tool } from "ai";
import { z } from "zod";

import { Connection, PublicKey } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";

import "dotenv/config";

export const getCirculatingMarketcap = () =>
  tool({
    description:
      "To get the circulating market cap of a token. responce should be in USD",
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
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.usdPrice;
  } catch (error) {
    return 0;
  }
};
