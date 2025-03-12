export const sessionUpdate = {
  type: "session.update",
  session: {
    tools: [
      {
        type: "function",
        name: "getWallets",
        description: "Get details of all user wallets.",
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
        description:
          "Get details of a token. there must be a token contract address. If not searchTokens, then ask user to specify which token to get details of.",
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
        description: "Search for tokens by symbol, name, or ticker.",
        parameters: {
          type: "object",
          strict: true,
          properties: {
            search_param: { type: "string" },
          },
          required: ["search_param"],
        },
      },
    ],
    tool_choice: "auto",
  },
};

let processing = false;

export const setToolProcessing = (value: boolean) => {
  processing = value;
};

export const getToolProcessing = () => processing;
