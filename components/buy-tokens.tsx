"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { TokenBuySkeleton } from "./buy-tokens-skeleton";

interface TokenBuyProps {
  userInfo: any;
  tokensInfo: any;
  onTransactionComplete?: (status: "success" | "error") => void;
}

export function TokenBuy({
  userInfo,
  tokensInfo,
  onTransactionComplete,
}: TokenBuyProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [shouldStopPolling, setShouldStopPolling] = useState(false);
  const [dataReceived, setDataReceived] = useState(false);
  const [swapData, setSwapData] = useState<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = async () => {
    setDataReceived(false);

    try {
      const response = await fetch("http://127.0.0.1:8000/buy/info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: tokensInfo.buying,
          amount: tokensInfo.buyingAmount,
          userId: userInfo.userId,
          userPassword: userInfo.userPassword,
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

    return () => stopPolling();
  }, []);

  const handleBuy = async () => {
    const transaction = swapData?.transactions[0];

    if (!transaction) {
      setError("Transaction data is missing.");
      return;
    }

    setShouldStopPolling(true);
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/buy/instructions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          //   address: tokensInfo.buying,
          //   amount: tokensInfo.buyingAmount,
          userId: userInfo.userId,
          userPassword: userInfo.userPassword,
          instructions: transaction.content,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Transaction successful:", data);
        onTransactionComplete?.("success");
      } else {
        throw new Error(data.message || "Transaction failed.");
      }
    } catch (error: any) {
      console.error("Transaction error:", error);
      setError(error.message);
      onTransactionComplete?.("error");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = () => {
    console.log("Transaction rejected by the user.");
    onTransactionComplete?.("error");
  };

  return swapData && dataReceived ? (
    <div className="flex flex-col gap-4 rounded-2xl p-4 bg-gray-900 max-w-lg text-white">
      <h2 className="text-lg font-semibold">Buy Token</h2>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          Out Amount:{" "}
          <span className="text-green-400">
            {swapData?.outAmount.toFixed(4)}
          </span>
        </div>
        <div>
          Min Out Amount:{" "}
          <span className="text-yellow-400">
            {swapData?.outAmountMin.toFixed(4)}
          </span>
        </div>
        <div>
          Price Impact:{" "}
          <span className="text-red-400">
            {swapData?.priceImpact.percent.toFixed(6)}%
          </span>
        </div>
        <div>
          Fee:{" "}
          <span className="text-gray-400">
            {swapData?.fees[0]?.amount.toFixed(6)} SOL (
            {swapData?.fees[0]?.percent * 100}%)
          </span>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-2">
        <Button
          onClick={handleBuy}
          disabled={loading}
          className="flex-1 bg-blue-500 hover:bg-blue-600"
        >
          {loading ? "Processing..." : "Confirm Purchase"}
        </Button>
        <Button
          onClick={handleReject}
          className="flex-1 bg-red-500 hover:bg-red-600"
        >
          Reject
        </Button>
      </div>
    </div>
  ) : (
    <TokenBuySkeleton />
  );
}
