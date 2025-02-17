export const searchTokensBySymbol = async (symbol: string) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/tokens/${symbol}`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    return (
      data?.data?.Solana?.DEXTrades?.map((trade: any) => ({
        mintAddress: trade.Trade.Buy.Currency.MintAddress,
        name: trade.Trade.Buy.Currency.Name,
        symbol: trade.Trade.Buy.Currency.Symbol,
        priceInUSD: `$ ${trade.Trade.Buy.PriceInUSD}`,
      })) || []
    );
  } catch (error) {
    console.error("Error fetching token data:", error);
    return [];
  }
};
