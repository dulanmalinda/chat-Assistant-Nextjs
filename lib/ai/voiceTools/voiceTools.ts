export const sessionUpdate = {
  type: "session.update",
  session: {
    tools: [
      {
        type: "function",
        name: "getWallets",
        description:
          "Get details of all user wallets. ** You cannot execute tools sequentially or parallely. only one task at a time **",
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
          "Get details of a token. there must be a token contract address. ** You cannot execute tools sequentially or parallely. only one task at a time **",
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
        description:
          "Search for tokens by symbol, name, or ticker. ** You cannot execute tools sequentially or parallely. only one task at a time **",
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
