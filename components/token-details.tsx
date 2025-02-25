"use client";

import cx from "classnames";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";

interface TokenDetailsProps {
  token: {
    name: string;
    symbol: string;
    mint: string;
    decimals: number;
    image?: string;
    description?: string;
    extensions?: {
      twitter?: string;
      telegram?: string;
    };
    creator?: {
      name?: string;
      site?: string;
    };
  };
  pools?: {
    liquidity: {
      usd: number;
    };
    price: {
      usd: number;
    };
    tokenSupply: number;
    marketCap: {
      usd: number;
    };
    createdAt?: number;
  }[];
  events?: {
    [key: string]: {
      priceChangePercentage: number;
    };
  };
  risk?: {
    rugged?: boolean;
    risks?: {
      name: string;
      level: string;
    }[];
    score?: number;
  };
}

export function TokenDetails({
  token,
  pools = [],
  events = {},
  risk,
}: TokenDetailsProps) {
  const pool = pools[0] || {};
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col gap-4 rounded-2xl p-4 bg-gray-900 max-w-lg text-white">
      <div className="flex items-center gap-2">
        {token.image && (
          <img
            src={token.image}
            alt={token.name}
            className="w-10 h-10 rounded-full"
          />
        )}
        <div>
          <div className="text-lg font-semibold">
            {token.name} ({token.symbol})
          </div>
          <div className="text-sm text-gray-400">{token.mint}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        {pool.price?.usd && (
          <div>
            Price:{" "}
            <span className="text-green-400">${pool.price.usd.toFixed(2)}</span>
          </div>
        )}
        {pool.marketCap?.usd && (
          <div>
            Market Cap:{" "}
            <span className="text-green-400">
              ${(pool.marketCap.usd / 1e6).toFixed(1)}M
            </span>
          </div>
        )}
        {pool.liquidity?.usd && (
          <div>
            Liquidity:{" "}
            <span className="text-green-400">
              ${(pool.liquidity.usd / 1e6).toFixed(1)}M
            </span>
          </div>
        )}
        {pool.tokenSupply && (
          <div>
            Supply: <span>{(pool.tokenSupply / 1e6).toFixed(2)}M</span>
          </div>
        )}
        {pool.createdAt && (
          <div>
            Age:{" "}
            <span>{formatDistanceToNow(new Date(pool.createdAt))} old</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2 text-xs">
        {events["1h"] && (
          <div>
            1h:{" "}
            <span
              className={cx(
                events["1h"].priceChangePercentage < 0
                  ? "text-red-400"
                  : "text-green-400"
              )}
            >
              {events["1h"].priceChangePercentage.toFixed(3)}%
            </span>
          </div>
        )}
        {events["24h"] && (
          <div>
            24h:{" "}
            <span
              className={cx(
                events["24h"].priceChangePercentage < 0
                  ? "text-red-400"
                  : "text-green-400"
              )}
            >
              {events["24h"].priceChangePercentage.toFixed(3)}%
            </span>
          </div>
        )}
        {events["30d"] && (
          <div>
            30d:{" "}
            <span
              className={cx(
                events["30d"].priceChangePercentage < 0
                  ? "text-red-400"
                  : "text-green-400"
              )}
            >
              {events["30d"].priceChangePercentage.toFixed(3)}%
            </span>
          </div>
        )}
      </div>

      {token.extensions &&
        (token.extensions.twitter || token.extensions.telegram) && (
          <div className="flex gap-4 text-sm">
            {token.extensions.twitter && (
              <a
                href={token.extensions.twitter}
                target="_blank"
                className="text-blue-400"
              >
                Twitter
              </a>
            )}
            {token.extensions.telegram && (
              <a
                href={token.extensions.telegram}
                target="_blank"
                className="text-blue-400"
              >
                Telegram
              </a>
            )}
          </div>
        )}

      {risk && risk.risks && risk.risks.length > 0 && (
        <div className="text-sm text-yellow-400">
          Risk: {risk.risks[0].name}
        </div>
      )}
    </div>
  );
}
