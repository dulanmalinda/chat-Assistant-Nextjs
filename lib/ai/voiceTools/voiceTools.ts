const commonDescription =
  "** You cannot execute tools parallely. Only one task at a time **";

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
        description: `Retrieve token balances for the wallets mentioned. If no wallets are specified, use active wallet ${commonDescription}`,
        parameters: {
          type: "object",
          strict: true,
          properties: {
            walletNames: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["walletNames"],
        },
      },
      {
        type: "function",
        name: "buyTokens",
        description: `Buy tokens for Sol. Always ask user for the amount.   ${commonDescription}`,
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
