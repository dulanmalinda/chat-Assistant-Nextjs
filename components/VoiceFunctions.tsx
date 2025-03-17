import React, { useState, useEffect, useRef } from "react";
import { sessionUpdate } from "@/lib/ai/voiceTools/voiceTools";
import { ChatRequestOptions, CreateMessage, Message } from "ai";
import { useVoiceChat } from "./VoiceChatContext";

type VoiceFunctionsProps = {
  events: any[];
  isSessionActive: boolean;
  sendClientEvent: (message: Record<string, any>) => void;
  chatId: string;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
};

export default function VoiceFunctions({
  events,
  isSessionActive,
  sendClientEvent,
  chatId,
  append,
}: VoiceFunctionsProps) {
  const [functionsAdded, setFunctionsAdded] = useState<boolean>(false);
  const didRequestToolExecution = useRef<boolean | null>(null);

  const { toolProcessing, setToolProcessing } = useVoiceChat();

  // useEffect(() => {
  //   if (!toolProcessing && didRequestToolExecution.current) {
  //     sendClientEvent({
  //       type: "response.create",
  //       response: {
  //         instructions:
  //           "Need to say that you have fulfilled users request. **The respoonce should be adjusted per initial request. dont ask further questions regarding this request.**",
  //       },
  //     });

  //     didRequestToolExecution.current = toolProcessing;
  //   }
  // }, [toolProcessing]);

  const onToolExecution = (message: string) => {
    const results = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: message,
          },
        ],
      },
    };

    sendClientEvent(results);

    setTimeout(() => {
      const response = {
        type: "response.create",
        response: {
          instructions: `You are working on users request. **Always ask user to wait until you receive data from this action**. Also let user know weather this step is an intermediary one.`,
        },
      };

      sendClientEvent(response);
    }, 1000);
  };

  useEffect(() => {
    if (!events || events.length === 0) return;

    const firstEvent = events[events.length - 1];
    if (!functionsAdded && firstEvent.type === "session.created") {
      sendClientEvent(sessionUpdate);
      setFunctionsAdded(true);
    }

    const mostRecentEvent = events[0];
    if (
      mostRecentEvent.type === "response.done" &&
      mostRecentEvent.response.output
    ) {
      mostRecentEvent.response.output.forEach((output: any) => {
        if (
          output.type === "function_call" &&
          output.status == "completed" &&
          !toolProcessing
        ) {
          setToolProcessing(true);
          didRequestToolExecution.current = true;

          if (!window.location.pathname.includes("/chat/")) {
            window.history.replaceState({}, "", `/chat/${chatId}`);
          }

          switch (output.name) {
            case "getWallets":
              onToolExecution(`Getting details of your wallets.`);

              append({
                role: "user",
                content: "Get details of wallets.",
              });

              break;
            case "getTokenDetails":
              const { address } = JSON.parse(output.arguments);

              onToolExecution(`Getting details of ${address}`);

              append({
                role: "user",
                content: `Get details of ${address} token`,
              });

              break;
            case "searchTokens":
              const { search_param } = JSON.parse(output.arguments);

              onToolExecution(`Searching for token ${search_param}`);

              append({
                role: "user",
                content: `Search for token: ${search_param}`,
              });
              break;
            case "checkWalletBalances":
              const { walletNames } = JSON.parse(output.arguments);

              onToolExecution(`Checking balances of wallet/wallets`);

              append({
                role: "user",
                content: `Check balances of ${
                  walletNames ?? "active wallet"
                } wallets`,
              });

              break;
            case "buyTokens":
              const { tokenAddress, amount } = JSON.parse(output.arguments);

              append({
                role: "user",
                content: `Buy ${tokenAddress} worth of ${amount} sol`,
              });
              break;
            case "getActiveWallet":
              // const { search_param } = JSON.parse(output.arguments);
              onToolExecution(`Getting details of the active wallet`);

              append({
                role: "user",
                content: `Get active wallet details`,
              });
              break;
            case "setActiveWallet":
              const { wallet_name } = JSON.parse(output.arguments);

              append({
                role: "user",
                content: `Set ${wallet_name} as the active wallet.`,
              });
              break;
            default:
              break;
          }

          setTimeout(() => {
            sendClientEvent({
              type: "response.create",
              response: {
                instructions:
                  "Need to say that you are working on users request",
              },
            });
          }, 500);
        }
      });
    }
  }, [events]);

  useEffect(() => {
    if (!isSessionActive) {
      setFunctionsAdded(false);
    }
  }, [isSessionActive]);

  return null;
}
