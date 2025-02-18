import WebSocket from "ws";
import "dotenv/config";

const token = process.env.BITQUERY_KEY;

export const subscribeToTokenPrice = (
  address: any,
  tradeExecutionPrice: any,
  callback: (data: any) => void
) => {
  const bitqueryConnection = new WebSocket(
    "wss://streaming.bitquery.io/eap?token=" + token,
    ["graphql-ws"]
  );

  bitqueryConnection.on("open", () => {
    console.log("Connected to Bitquery.");

    // Send initialization message (connection_init)
    const initMessage = JSON.stringify({ type: "connection_init" });
    bitqueryConnection.send(initMessage);
  });

  bitqueryConnection.on("message", (data: any) => {
    const response = JSON.parse(data);

    // Handle connection acknowledgment (connection_ack)
    if (response.type === "connection_ack") {
      console.log("Connection acknowledged by server.");

      // Send subscription message after receiving connection_ack
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

      // Stop logic after 30 seconds (adjustable)
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

    // Handle received data
    if (response.type === "data") {
      const tradeData =
        response.payload?.data?.Solana?.DEXTrades?.[0]?.Trade?.Buy;
      if (tradeData) {
        console.log("Received data from Bitquery:", tradeData);
        callback(tradeData);
      }
    }

    // Handle keep-alive messages (ka)
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
