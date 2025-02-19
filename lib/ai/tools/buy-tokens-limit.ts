import { tool } from "ai";
import { Session } from "next-auth";
import { z } from "zod";

import crypto from "crypto";

import { checkWalletBalanceApi } from "./wallet-balance";

import { isValidSolanaAddress } from "@/lib/utils";
import { searchTokensBySymbol } from "../search-tokens";

import { Connection, PublicKey } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";

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
      mcapBasedBuyCondition: z.number(),
      isGreaterThan: z.boolean(),
    }),
    execute: async ({
      address,
      amount,
      mcapBasedBuyCondition,
      isGreaterThan,
    }) => {
      const userId = session.user?.email;
      const userEncryptionKey = deriveKey(session);

      if (!userId || !userEncryptionKey) {
        return `Failed to place order. Try again.`;
      }

      const balanceResponce = await checkWalletBalanceApi(
        userId,
        userEncryptionKey
      );

      if (Number(balanceResponce.balance) < 0.11 + amount) {
        return `Your wallet balance is ${balanceResponce.balance} sol, which is less than 0.11 sol + buy amount. You need at least 0.11 sol + buy amount. Mention about 0.11 sol, it's a must.`;
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

      const currentTokenSupply = await getCurrentTokenSupply(address);

      if (currentTokenSupply <= 0) return "Failed to place limit order.";

      console.log(mcapBasedBuyCondition);
      const tradeExecutionPrice = mcapBasedBuyCondition / currentTokenSupply;
      console.log(tradeExecutionPrice);

      try {
        const didPlaceOrder = await subscribeAndExecuteOrder_ForTokenPrice(
          userId,
          userEncryptionKey,
          address,
          amount,
          tradeExecutionPrice,
          isGreaterThan
        );

        if (didPlaceOrder) {
          return "Limit order placed successfully.";
        } else {
          return "Failed to place limit order.";
        }
      } catch (error) {
        return "Failed to place limit order.";
      }
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
  amount: any,
  tradeExecutionPrice: any,
  isGreaterThan: boolean
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const bitqueryConnection = new WebSocket(
      "wss://streaming.bitquery.io/eap?token=" + process.env.BITQUERY_KEY,
      ["graphql-ws"]
    );

    let isConnected = false;

    let didExecuted = false;

    bitqueryConnection.on("open", () => {
      console.log("Connected to Bitquery.");
      isConnected = true;
      resolve(true);

      const initMessage = JSON.stringify({ type: "connection_init" });
      bitqueryConnection.send(initMessage);
    });

    bitqueryConnection.on("message", async (data: any) => {
      try {
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

            if (!didExecuted) {
              if (isGreaterThan) {
                if (tradeData.PriceInUSD > tradeExecutionPrice) {
                  didExecuted = true;
                  buyTokensApi(userId, userPassword, address, amount)
                    .then(() => {
                      bitqueryConnection.close();
                      console.error("Buy order Success:");
                    })
                    .catch((error) => {
                      bitqueryConnection.close();
                      console.error("Buy order failed:", error);
                    });
                }
              } else {
                if (tradeData.PriceInUSD < tradeExecutionPrice) {
                  didExecuted = true;
                  buyTokensApi(userId, userPassword, address, amount)
                    .then(() => {
                      bitqueryConnection.close();
                      console.error("Buy order Success:");
                    })
                    .catch((error) => {
                      bitqueryConnection.close();
                      console.error("Buy order failed:", error);
                    });
                }
              }
            }
          }
        }

        if (response.type === "ka") {
          console.log("Keep-alive message received.");
        }

        if (response.type === "error") {
          console.error("Error message received:", response);
          reject(false);
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    });

    bitqueryConnection.on("close", () => {
      console.log("Disconnected from Bitquery.");
      if (!isConnected) {
        reject(false);
      }
    });

    bitqueryConnection.on("error", (error) => {
      console.error("WebSocket Error:", error);
      reject(false);
    });
  });
};

const getCurrentTokenSupply = async (address: string): Promise<number> => {
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
