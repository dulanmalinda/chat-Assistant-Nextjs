"use client";

import { formatDistanceToNow } from "date-fns";

interface TokenSearchResult {
  id: string;
  name: string;
  symbol: string;
  mint: string;
  image: string;
  decimals: number;
  quoteToken: string;
  hasSocials: boolean;
  poolAddress: string;
  liquidityUsd: number | undefined;
  marketCapUsd: number | undefined;
  priceUsd: number | undefined;
  lpBurn: number | undefined;
  market: string;
  freezeAuthority: string | null;
  mintAuthority: string | null;
  deployer: string;
  createdAt: number | undefined;
  status: string;
  lastUpdated: number;
  holders: number | undefined;
  buys: number | undefined;
  sells: number | undefined;
  totalTransactions: number | undefined;
}

interface TokenSearchResultsProps {
  results: TokenSearchResult[];
  total: number;
}

export function TokenSearch({ results, total }: TokenSearchResultsProps) {
  // Helper function to safely format the age
  const getTokenAge = (createdAt: number | undefined) => {
    if (!createdAt || isNaN(createdAt)) {
      return "Unknown age";
    }
    try {
      const date = new Date(createdAt);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return `${formatDistanceToNow(date)} old`;
    } catch (error) {
      console.error(`Error formatting date for createdAt: ${createdAt}`, error);
      return "Error";
    }
  };

  return (
    <div className="flex flex-col gap-6 text-white">
      <div className="text-lg font-semibold">Search Results</div>

      {results === undefined ? (
        <div className="text-gray-400 text-center py-8">
          No tokens found matching your criteria
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((token, index) => (
            <div
              key={index}
              className="bg-gray-900 rounded-xl p-4 flex flex-col gap-3 border border-gray-800 hover:border-gray-700 transition-colors relative"
            >
              <div className="flex items-start gap-3">
                {token.image && (
                  <img
                    src={token.image}
                    alt={token.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <div className="font-semibold text-lg">
                    {token.name} ({token.symbol})
                  </div>
                  <div className="text-xs text-gray-400 break-all overflow-wrap-break-word">
                    {token.mint}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  Price:{" "}
                  <span className="text-green-400">
                    {token.priceUsd !== undefined
                      ? `$${token.priceUsd.toFixed(6)}`
                      : "N/A"}
                  </span>
                </div>
                <div>
                  Market Cap:{" "}
                  <span className="text-green-400">
                    {token.marketCapUsd !== undefined
                      ? `$${(token.marketCapUsd / 1e6).toFixed(2)}M`
                      : "N/A"}
                  </span>
                </div>
                <div>
                  Liquidity:{" "}
                  <span className="text-green-400">
                    {token.liquidityUsd !== undefined
                      ? `$${(token.liquidityUsd / 1e6).toFixed(2)}M`
                      : "N/A"}
                  </span>
                </div>
                <div>
                  Holders: <span>{token.holders ?? "N/A"}</span>
                </div>
                <div>
                  Age: <span>{getTokenAge(token.createdAt)}</span>
                </div>
                <div>
                  LP Burn:{" "}
                  <span>
                    {token.lpBurn !== undefined ? `${token.lpBurn}%` : "N/A"}
                  </span>
                </div>
              </div>

              <div className="flex gap-4 text-xs text-gray-300 flex-wrap">
                <span className="break-all overflow-wrap-break-word">
                  Buys: {token.buys ?? "N/A"}
                </span>
                <span className="break-all overflow-wrap-break-word">
                  Sells: {token.sells ?? "N/A"}
                </span>
                <span className="break-all overflow-wrap-break-word">
                  Txns: {token.totalTransactions ?? "N/A"}
                </span>
              </div>

              <div className="text-xs text-gray-400 break-all overflow-wrap-break-word">
                Market: {token.market}
              </div>

              {/* Number in bottom-right corner */}
              <div className="absolute bottom-2 right-2 text-gray-500 text-xs font-medium">
                #{index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
