import { tool } from "ai";
import { Session } from "next-auth";
import { z } from "zod";

import crypto from "crypto";

import { checkWalletBalanceApi } from "./wallet-balance-active";

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
    description: "To place buy orders.",
    parameters: z.object({
      address: z.string(),
      amount: z.number(),
      buyLimitValue: z.number(),
      isGreaterThan: z.boolean(),
    }),
    execute: async ({ address, amount, buyLimitValue, isGreaterThan }) => {
      const userId = session.user?.email;
      const userEncryptionKey = deriveKey(session);

      if (!userId || !userEncryptionKey) {
        return `Failed to place order. Try again.`;
      }

      const balanceResponce = await checkWalletBalanceApi(
        userId,
        userEncryptionKey
      );

      // if (Number(balanceResponce.balance) < 0.11 + amount) {
      //   return `Your wallet balance is ${balanceResponce.balance} sol, which is less than 0.11 sol + buy amount. You need at least 0.11 sol + buy amount. Mention about 0.11 sol, it's a must.`;
      // }

      if (!isValidSolanaAddress(address)) {
        const response = await searchTokensBySymbol(address);
        return {
          ...response,
          searchMessage: `Here are the search results for ${address}.`,
          warningNote:
            "⚠️ Please use the CA of the token for on-chain activities and detailed information about the token metadata.",
        };
      }

      const circulatingTokenSupply = await getCirculatingTokenSupply(address);
      if (circulatingTokenSupply <= 0) return "Failed to place limit order.";

      const currentTokenPrice = await getCurrentTokenPrice(address);
      if (currentTokenPrice <= 0) return "Failed to place limit order.";

      let isMarketCapProvided = false;
      if (buyLimitValue > currentTokenPrice * 1000) {
        isMarketCapProvided = true;
      }

      let buyLimitPrice = 0;

      if (isMarketCapProvided)
        buyLimitPrice = buyLimitValue / circulatingTokenSupply;
      else buyLimitPrice = buyLimitValue;

      console.log(buyLimitValue);
      console.log(circulatingTokenSupply);
      console.log(buyLimitValue / circulatingTokenSupply);
      console.log(currentTokenPrice);
      console.log(buyLimitPrice);

      if (buyLimitPrice <= 0) return "Failed to place limit order.";

      try {
        const didPlaceOrder = await subscribeAndExecuteOrder_ForTokenPrice(
          userId,
          userEncryptionKey,
          address,
          amount,
          buyLimitPrice,
          isGreaterThan
        );

        if (didPlaceOrder) {
          return `Limit order placed successfully.`;
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
  buyLimitPrice: any,
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
          const currentTokenPrice =
            response.payload?.data?.Solana?.DEXTrades?.[0]?.Trade?.Buy
              ?.PriceInUSD;
          if (currentTokenPrice) {
            console.log(
              "Received Token price from Bitquery:",
              currentTokenPrice
            );

            console.log("trigger price", buyLimitPrice);

            (async () => {
              didExecuted = await executeTrade(
                currentTokenPrice,
                buyLimitPrice,
                isGreaterThan,
                didExecuted,
                userId,
                userPassword,
                address,
                amount,
                bitqueryConnection
              );

              console.log("Trade executed:", didExecuted);
            })();
          }
        }

        if (response.type === "ka") {
          console.log("Keep-alive message received.");

          const currentTokenPrice = await getCurrentTokenPrice(address);
          (async () => {
            didExecuted = await executeTrade(
              currentTokenPrice,
              buyLimitPrice,
              isGreaterThan,
              didExecuted,
              userId,
              userPassword,
              address,
              amount,
              bitqueryConnection
            );

            console.log("Trade executed:", didExecuted);
          })();
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

async function executeTrade(
  currentTokenPrice: number,
  buyLimitPrice: number,
  isGreaterThan: boolean,
  didExecuted: boolean,
  userId: string,
  userPassword: string,
  address: string,
  amount: number,
  bitqueryConnection: any
): Promise<boolean> {
  if (didExecuted) return didExecuted;

  const shouldExecute =
    (isGreaterThan && currentTokenPrice > buyLimitPrice) ||
    (!isGreaterThan && currentTokenPrice < buyLimitPrice);

  if (shouldExecute) {
    didExecuted = true;

    console.log("Stopping WebSocket subscription.");
    const stopMessage = JSON.stringify({ type: "stop", id: "1" });
    bitqueryConnection.send(stopMessage);
    bitqueryConnection.close();

    try {
      await buyTokensApi(userId, userPassword, address, amount);
      console.error("Buy order Success:");
    } catch (error) {
      console.error("Buy order failed:", error);
    }
  }

  return didExecuted;
}

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
