import React, { useState, useEffect, useRef } from "react";

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
  const didRequestToolExecution = useRef<boolean | null>(null);

  const {
    voiceToolProcessing,
    setVoiceToolProcessing,
    addVoiceMessage,
    setToolCallId,
  } = useVoiceChat();

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

  const onToolExecution = (message: string, call_id: string) => {
    const results = {
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id: call_id,
        output: message,
      },
    };

    sendClientEvent(results);
  };

  useEffect(() => {
    if (!events || events.length === 0) return;

    const mostRecentEvent = events[0];
    if (
      mostRecentEvent.type === "response.done" &&
      mostRecentEvent.response.output
    ) {
      mostRecentEvent.response.output.forEach((output: any) => {
        if (
          output.type === "function_call" &&
          output.status == "completed" &&
          !voiceToolProcessing
        ) {
          setVoiceToolProcessing(true);
          didRequestToolExecution.current = true;

          if (!window.location.pathname.includes("/chat/")) {
            window.history.replaceState({}, "", `/chat/${chatId}`);
          }

          switch (output.name) {
            case "getWallets":
              // const executeTool = async () => {
              //   try {
              //     const response = await fetch("/api/voice/tools/getWallets", {
              //       method: "GET",
              //       headers: { "Content-Type": "application/json" },
              //     });
              //     if (!response.ok)
              //       throw new Error(`HTTP error! Status: ${response.status}`);
              //     const data = await response.json();

              //     console.log(data);

              //     const newMessage = {
              //       id: mostRecentEvent.response.id,
              //       content: "getWallets",
              //       role: "assistant" as const,
              //       toolInvocations: [
              //         {
              //           args: {},
              //           state: "call" as const,
              //           step: 0,
              //           toolCallId: output.call_id,
              //           toolName: "getWallets",
              //         },
              //       ],
              //     };

              //     onToolExecution(JSON.stringify(data), output.call_id);
              //     addVoiceMessage(newMessage);
              //   } catch (error) {
              //     console.error("Error calling execute-tool API:", error);
              //   }
              // };

              // executeTool();

              // onToolExecution(`Getting wallet details`);

              setToolCallId(output.call_id);

              append({
                role: "user",
                content: `Get details of all wallets`,
              });

              break;
            case "getTokenDetails":
              const { address } = JSON.parse(output.arguments);

              setToolCallId(output.call_id);

              append({
                role: "user",
                content: `Get details of ${address} token`,
              });

              break;
            case "searchTokens":
              const { search_param } = JSON.parse(output.arguments);

              setToolCallId(output.call_id);

              append({
                role: "user",
                content: `Search for token: ${search_param}`,
              });
              break;
            case "checkWalletBalances":
              const { walletNames } = JSON.parse(output.arguments);

              setToolCallId(output.call_id);

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
              // onToolExecution(`Getting details of the active wallet`);

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
        }
      });
    }
  }, [events]);

  return null;
}
