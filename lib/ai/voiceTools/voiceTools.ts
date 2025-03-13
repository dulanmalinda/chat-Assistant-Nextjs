const commonDescription =
  "** You cannot execute tools sequentially or parallely. only one task at a time **";

export const sessionUpdate = {
  type: "session.update",
  session: {
    tools: [
      {
        type: "function",
        name: "getWallets",
        description: `Get details of all user wallets. ${commonDescription}`,
        parameters: {
          type: "object",
          strict: true,
          properties: {},
          required: [],
        },
      },
      {
        type: "function",
        name: "getTokenDetails",
        description: `Get details of a token. There must be a token contract address. ${commonDescription}`,
        parameters: {
          type: "object",
          strict: true,
          properties: {
            address: { type: "string" },
          },
          required: ["address"],
        },
      },
      {
        type: "function",
        name: "searchTokens",
        description: `Search for tokens by symbol, name, or ticker. ${commonDescription}`,
        parameters: {
          type: "object",
          strict: true,
          properties: {
            search_param: { type: "string" },
          },
          required: ["search_param"],
        },
      },
      {
        type: "function",
        name: "checkWalletBalances",
        description: `Get token balances of wallet/wallets. First, you must get the address/addresses of the mentioned wallet/wallets. If no wallets are mentioned, get the address of the active wallet. ${commonDescription}`,
        parameters: {
          type: "object",
          strict: true,
          properties: {
            walletAddresses: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["walletAddresses"],
        },
      },
      {
        type: "function",
        name: "buyTokens",
        description: `Buy Tokens with SOL.  ${commonDescription}`,
        parameters: {
          type: "object",
          strict: true,
          properties: {
            tokenAddress: { type: "string" },
            amount: { type: "number" },
          },
          required: ["tokenAddress", "amount"],
        },
      },
      {
        type: "function",
        name: "getActiveWallet",
        description: `Get active wallet details. ${commonDescription}`,
        parameters: {
          type: "object",
          strict: true,
          properties: {},
          required: [],
        },
      },
      {
        type: "function",
        name: "setActiveWallet",
        description: `Set the active wallet. ${commonDescription}`,
        parameters: {
          type: "object",
          strict: true,
          properties: {
            wallet_name: { type: "string" },
          },
          required: ["wallet_name"],
        },
      },
    ],
    tool_choice: "auto",
  },
};
