import { traderVoicePrompt } from "../prompts";

export const sessionUpdate = {
  type: "session.update",
  session: {
    instructions: traderVoicePrompt,
    tools: [
      {
        type: "function",
        name: "getWallets",
        description: `Get information of all wallets owned by the user. This does not include token balances.`,
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
        description: `Get details of a token.`,
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
        description: `Search for tokens by symbol, name, or ticker.`,
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
        description: `Get token balances of wallets.`,
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
        description: `Buy tokens with SOL. Always ask user about with how much SOL they want to make the purchase.`,
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
        description: `Get the active wallet details. This does not include token balances.`,
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
        description: `Set the active wallet.`,
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
