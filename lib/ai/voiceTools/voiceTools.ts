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
          "Get details of a token. Must check whether the provided CA is valid before proceeding. If a CA is not provided, search for the token.",
        parameters: {
          type: "object",
          strict: true,
          properties: {
            address: { type: "string" },
          },
          required: ["address"],
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
