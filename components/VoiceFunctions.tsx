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
              append({
                role: "user",
                content: "Get details of all my wallets",
              });

              break;
            case "getTokenDetails":
              const { address } = JSON.parse(output.arguments);

              append({
                role: "user",
                content: `Get details of ${address} token`,
              });

              break;
            case "searchTokens":
              const { search_param } = JSON.parse(output.arguments);

              append({
                role: "user",
                content: `Search for ${search_param} token`,
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
