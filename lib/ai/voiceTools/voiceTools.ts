const functionDescription = `
Get details of all user wallets.
`;

export const sessionUpdate = {
  type: "session.update",
  session: {
    tools: [
      {
        type: "function",
        name: "getWallets",
        description: functionDescription,
        parameters: {
          type: "object",
          strict: true,
          properties: {},
          required: [],
        },
      },
    ],
    tool_choice: "auto",
  },
};
