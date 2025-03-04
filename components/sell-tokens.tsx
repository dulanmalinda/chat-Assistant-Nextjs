"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { TokenBuySkeleton } from "./buy-tokens-skeleton";
import { TokenSellError } from "./sell-tokens-error";

interface TokenBuyProps {
  tokensInfo: any;
  onTransactionComplete?: (status: "success" | "error") => void;
}

export function TokenSell({
  tokensInfo,
  onTransactionComplete,
}: TokenBuyProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [shouldStopPolling, setShouldStopPolling] = useState(false);
  const [dataReceived, setDataReceived] = useState(false);
  const [swapData, setSwapData] = useState<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [transactionStatus, setTransactionStatus] = useState<
    "pending" | "success" | "error" | null
  >(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const [tokenDetails, setTokenDetails] = useState<any>(null);

  const fetchTokenDetails = async () => {
    try {
      const response = await fetch(
        `https://app.armorwallet.io/api-python/token/${tokensInfo.selling}`
      );
      const data = await response.json();
      setTokenDetails(data.token);
    } catch (error) {
      console.error("Error fetching token details:", error);
    }
  };

  const fetchData = async () => {
    setDataReceived(false);

    try {
      const response = await fetch("/api/sell-token/info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: tokensInfo.selling,
          amount: tokensInfo.sellingAmount,
        }),
      });

      const data = await response.json();
      setSwapData(data.swap_info);
      console.log("API Response:", data.swap_info);

      setDataReceived(true);

      if (shouldStopPolling) {
        stopPolling();
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  const startPolling = (intervalMs = 30000) => {
    if (intervalRef.current) return;

    fetchData();

    intervalRef.current = setInterval(() => {
      setShouldStopPolling((prev) => {
        if (!prev) {
          fetchData();
        } else {
          stopPolling();
        }
        return prev;
      });
    }, intervalMs);
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    startPolling();
    fetchTokenDetails();

    return () => stopPolling();
  }, []);

  const handleSell = async () => {
    const transaction = swapData?.transactions[0];

    if (!transaction) {
      setError("Transaction data is missing.");
      return;
    }

    setShouldStopPolling(true);
    setLoading(true);
    setError("");
    setTransactionStatus("pending");

    try {
      const response = await fetch("/api/sell-token/instructions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructions: transaction.content,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Transaction successful:", data);
        setTransactionStatus("success");
        setTransactionId(data.transaction_id.signature);
        onTransactionComplete?.("success");
      } else {
        throw new Error(data.message || "Transaction failed.");
      }
    } catch (error: any) {
      console.error("Transaction error:", error);
      setError(error.message);
      setTransactionStatus("error");
      onTransactionComplete?.("error");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = () => {
    console.log("Transaction rejected by the user.");
    setShouldStopPolling(true);
    setTransactionStatus("error");
    onTransactionComplete?.("error");
  };

  if (!swapData || !dataReceived || !tokenDetails) {
    return <TokenBuySkeleton />;
  }

  if (!swapData?.outAmount) {
    return (
      <TokenSellError
        tokenDetails={tokenDetails}
        tokensInfo={tokensInfo}
        errorMessage="Unable to generate swap data for this token"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl p-6 bg-gray-900 max-w-lg text-white">
      <h2 className="text-2xl font-semibold flex items-center gap-2">
        <span className="text-white py-1 rounded-full">Swap</span>
      </h2>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>Selling</div>
        <div className="text-blue-400">
          {tokenDetails ? (
            <>
              {tokenDetails.name} ({tokenDetails.symbol})
            </>
          ) : (
            <span className="text-gray-400">Loading...</span>
          )}
        </div>

        <div>Buying</div>
        <div className="text-blue-400">{tokensInfo.buying}</div>

        <div>Amount Selling</div>
        <div className="text-red-400">
          -{tokensInfo.sellingAmount} {tokenDetails.symbol || "Token"}
        </div>

        <div>Amount Buying</div>
        <div className="text-green-400">
          +{swapData.outAmount.toFixed(2)} SOL
        </div>

        <div>Price Impact</div>
        <div className="text-red-400">
          {swapData?.priceImpact.percent.toFixed(2)}%
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {transactionStatus === "success" ? (
        <p className="text-green-400 text-sm break-words break-all whitespace-pre-wrap w-full overflow-hidden">
          Transaction successful! TX ID: {transactionId}
        </p>
      ) : transactionStatus === "error" ? (
        <p className="text-red-400 text-sm">Transaction rejected or failed.</p>
      ) : (
        <div className="flex gap-2">
          <Button
            onClick={handleSell}
            disabled={loading}
            className="flex-1 bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded-lg"
          >
            {loading ? "Processing..." : "CONFIRM"}
          </Button>
          <Button
            onClick={handleReject}
            className="flex-1 bg-transparent text-gray-400 font-bold py-2 px- rounded-lg hover:text-gray-500 hover:bg-transparent"
          >
            REJECT/EDIT
          </Button>
        </div>
      )}
    </div>
  );
}
