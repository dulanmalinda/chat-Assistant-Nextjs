import { tool } from "ai";
import { Session } from "next-auth";
import { z } from "zod";

import crypto from "crypto";

import { checkWalletBalanceApi } from "./wallet-balance";

import { isValidSolanaAddress } from "@/lib/utils";
import { searchTokensBySymbol } from "../search-tokens";

import WebSocket from "ws";
import "dotenv/config";

interface buyTokensProps {
  session: Session;
}

export const orderBuyTokens = ({ session }: buyTokensProps) =>
  tool({
    description: "To buy Tokens",
    parameters: z.object({
      address: z.string(),
      amount: z.number(),
    }),
    execute: async ({ address, amount }) => {
      const userId = session.user?.email;
      const userEncryptionKey = deriveKey(session);

      let orderBuyTokensResponce = "";

      if (userId && userEncryptionKey) {
        const balanceResponce = await checkWalletBalanceApi(
          userId,
          userEncryptionKey
        );
        if (Number(balanceResponce.balance) < 0.11 + amount) {
          orderBuyTokensResponce = `Your wallet balance is ${balanceResponce.balance} sol, which is less than 0.11 sol + buy amount. You need at least 0.11 sol + buy amount. mention about 0.11 sol, its a must`;
          return orderBuyTokensResponce;
        }

        if (!isValidSolanaAddress(address)) {
          const response = await searchTokensBySymbol(address);
          return {
            ...response,
            searchMessage: `Here are the search results for ${address}.`,
            warningNote:
              "⚠️ Please use the CA of the token for on-chain activities and detailed information about the token metadata.",
          };
        }

        const responce = await buyTokensApi(
          userId,
          userEncryptionKey,
          address,
          amount
        );
        orderBuyTokensResponce = responce;
        return orderBuyTokensResponce;
      }

      orderBuyTokensResponce = `Failed to palce order. Try again.`;
      return orderBuyTokensResponce;
    },
  });

const deriveKey = (session: Session) => {
  if (!session?.user?.email)
    throw new Error("User ID is required for key derivation");

  const salt = process.env.ENCRYPTION_SALT || "default-salt";
  const key = crypto.pbkdf2Sync(session.user.email, salt, 100000, 32, "sha256");

  return key.toString("hex");
};

const buyTokensApi = async (
  userId: string,
  userPassword: string,
  address: string,
  amount: number
) => {
  try {
    const response = await fetch("http://127.0.0.1:8000/buy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address,
        amount,
        userId,
        userPassword,
      }),
    });

    if (!response.ok) {
      return `Error: ${response.status} ${response.statusText}`;
    }

    return await response.json();
  } catch (error) {
    console.error("Error buying tokens:", error);
    return error;
  }
};

const subscribeAndExecuteOrder_ForTokenPrice = (
  userId: string,
  userPassword: string,
  address: any,
  tradeExecutionPrice: any
) => {
  const bitqueryConnection = new WebSocket(
    "wss://streaming.bitquery.io/eap?token=" + process.env.BITQUERY_KEY,
    ["graphql-ws"]
  );

  bitqueryConnection.on("open", () => {
    console.log("Connected to Bitquery.");

    const initMessage = JSON.stringify({ type: "connection_init" });
    bitqueryConnection.send(initMessage);
  });

  bitqueryConnection.on("message", (data: any) => {
    const response = JSON.parse(data);

    if (response.type === "connection_ack") {
      console.log("Connection acknowledged by server.");

      const subscriptionMessage = JSON.stringify({
        type: "start",
        id: "1",
        payload: {
          query: `
          subscription {
            Solana {
              DEXTrades(
                where: {Trade: {Buy: {Currency: {MintAddress: {is: "${address}"}}}}}
                limit: {count: 1}
              ) {
                Trade {
                  Buy {
                    Currency {
                      Decimals
                      Name
                    }
                    PriceInUSD
                  }
                }
              }
            }
          }
          `,
        },
      });

      bitqueryConnection.send(subscriptionMessage);
      console.log("Subscription message sent.");

      setTimeout(() => {
        const stopMessage = JSON.stringify({ type: "stop", id: "1" });
        bitqueryConnection.send(stopMessage);
        console.log("Stop message sent after 30 seconds.");

        setTimeout(() => {
          console.log("Closing WebSocket connection.");
          bitqueryConnection.close();
        }, 1000);
      }, 30000);
    }

    if (response.type === "data") {
      const tradeData =
        response.payload?.data?.Solana?.DEXTrades?.[0]?.Trade?.Buy;
      if (tradeData) {
        console.log("Received data from Bitquery:", tradeData);

        //buy function here
      }
    }

    if (response.type === "ka") {
      console.log("Keep-alive message received.");
    }

    if (response.type === "error") {
      console.error("Error message received:", response);
    }
  });

  bitqueryConnection.on("close", () => {
    console.log("Disconnected from Bitquery.");
  });

  bitqueryConnection.on("error", (error) => {
    console.error("WebSocket Error:", error);
  });
};
