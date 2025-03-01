interface TokenBuyErrorProps {
  tokenDetails: any;
  tokensInfo: any;
  errorMessage?: string;
}

export function TokenBuyError({
  tokenDetails,
  tokensInfo,
  errorMessage,
}: TokenBuyErrorProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl p-6 bg-gray-900 max-w-lg text-white">
      <h2 className="text-2xl font-semibold flex items-center gap-2">
        <span className="text-white py-1 rounded-full">Swap Error</span>
      </h2>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>Selling</div>
        <div className="text-blue-400">{tokensInfo.selling}</div>

        <div>Buying</div>
        <div className="text-blue-400">
          {tokenDetails ? (
            <>
              {tokenDetails.name} ({tokenDetails.symbol})
            </>
          ) : (
            <span className="text-gray-400">Loading...</span>
          )}
        </div>

        <div>Amount Selling</div>
        <div className="text-red-400">-{tokensInfo.buyingAmount} SOL</div>
      </div>

      <div className="text-red-400 text-sm">
        {errorMessage || "Unable to generate swap data for this token"}
      </div>
    </div>
  );
}
