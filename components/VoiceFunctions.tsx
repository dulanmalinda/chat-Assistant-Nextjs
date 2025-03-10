import React, { useState, useEffect } from "react";
import { sessionUpdate } from "@/lib/ai/voiceTools/voiceTools";

type VoiceFunctionsProps = {
  events: any[];
  isSessionActive: boolean;
  sendClientEvent: (message: Record<string, any>) => void;
};

export default function VoiceFunctions({
  events,
  isSessionActive,
  sendClientEvent,
}: VoiceFunctionsProps) {
  const [functionAdded, setFunctionAdded] = useState<boolean>(false);

  useEffect(() => {
    if (!events || events.length === 0) return;

    const firstEvent = events[events.length - 1];
    if (!functionAdded && firstEvent.type === "session.created") {
      sendClientEvent(sessionUpdate);
      setFunctionAdded(true);
    }

    const mostRecentEvent = events[0];
    if (
      mostRecentEvent.type === "response.done" &&
      mostRecentEvent.response.output
    ) {
      mostRecentEvent.response.output.forEach((output: any) => {
        if (
          output.type === "function_call" &&
          output.name === "getWallets" &&
          output.status == "completed"
        ) {
          console.log(output);
          setTimeout(() => {
            sendClientEvent({
              type: "response.create",
              response: {
                instructions: `
                    say that u have completed retrieving the wallets
                  `,
              },
            });
          }, 500);
        }
      });
    }
  }, [events]);

  useEffect(() => {
    if (!isSessionActive) {
      setFunctionAdded(false);
    }
  }, [isSessionActive]);

  return null;
}
