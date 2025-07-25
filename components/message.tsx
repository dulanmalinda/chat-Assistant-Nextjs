"use client";

import type { ChatRequestOptions, Message } from "ai";
import cx from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { memo, useEffect, useMemo, useState } from "react";

import type { Vote } from "@/lib/db/schema";

import { DocumentToolCall, DocumentToolResult } from "./document";
import {
  ChevronDownIcon,
  LoaderIcon,
  PencilEditIcon,
  SparklesIcon,
} from "./icons";
import { Markdown } from "./markdown";
import { MessageActions } from "./message-actions";
import { PreviewAttachment } from "./preview-attachment";
import { Weather } from "./weather";
import equal from "fast-deep-equal";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { MessageEditor } from "./message-editor";
import { DocumentPreview } from "./document-preview";
import { MessageReasoning } from "./message-reasoning";
import { TokenDetails } from "./token-details";
import { TokenDetailsSkeleton } from "./token-details-skeleton";
import { TokenBuy } from "./buy-tokens";
import { TokenBuySkeleton } from "./buy-tokens-skeleton";
import { TokenSearch } from "./search-tokens";
import { TokenSearchSkeleton } from "./search-tokens-skeleton";
import { TokenSell } from "./sell-tokens";
import { TokenSellSkeleton } from "./sell-tokens-skeleton";

import { useVoiceChat } from "./VoiceChatContext";

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  reload,
  isReadonly,
}: {
  chatId: string;
  message: Message;
  vote: any | undefined;
  isLoading: boolean;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[])
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");

  const {
    sendClientEvent,
    voiceToolProcessing,
    setVoiceToolProcessing,
    toolCallId,
  } = useVoiceChat();

  const removeAddressInfo = (input: string): string => {
    const addressPattern = /\b[13-9A-HJ-NP-Za-km-z]{32,44}\b/g;

    const labelPattern = /\s*-?\s*\**\s*(Address|Private)\s*\**\s*[:]?/gi;

    const lines = input.split("\n");
    const processedLines = lines.map((line) => {
      let cleanedLine = line.replace(addressPattern, "");
      cleanedLine = cleanedLine.replace(labelPattern, "");
      return cleanedLine.trim();
    });

    return processedLines
      .filter((line) => line.length > 0)
      .join("\n")
      .trim();
  };

  const sendToolResultVoiceAPI = (message: string, call_id: string) => {
    const results = {
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id: call_id,
        output: message,
      },
    };

    sendClientEvent(results);

    sendClientEvent({
      type: "response.create",
      // response: {
      //   instructions:
      //     "Avoid repeating the information. They are already shown to user.",
      // },
    });
  };

  useEffect(() => {
    if (!message.toolInvocations || !voiceToolProcessing) return;

    const hasResult = message.toolInvocations.some(
      (toolInvocation) => toolInvocation.state === "result"
    );

    if (hasResult) {
      const timer = setTimeout(() => {
        if (toolCallId) {
          sendToolResultVoiceAPI(
            removeAddressInfo(message.content.toString()),
            toolCallId
          );
        }

        setVoiceToolProcessing(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [message.content]);

  return (
    <AnimatePresence>
      <motion.div
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            "flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
            {
              "w-full": mode === "edit",
              "group-data-[role=user]/message:w-fit": mode !== "edit",
            }
          )}
        >
          {message.role === "assistant" && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <SparklesIcon size={14} />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 w-full">
            {message.experimental_attachments && (
              <div className="flex flex-row justify-end gap-2">
                {message.experimental_attachments.map((attachment) => (
                  <PreviewAttachment
                    key={attachment.url}
                    attachment={attachment}
                  />
                ))}
              </div>
            )}

            {message.reasoning && (
              <MessageReasoning
                isLoading={isLoading}
                reasoning={message.reasoning}
              />
            )}

            {(message.content || message.reasoning) && mode === "view" && (
              <div className="flex flex-row gap-2 items-start">
                {message.role === "user" && !isReadonly && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                        onClick={() => {
                          setMode("edit");
                        }}
                      >
                        <PencilEditIcon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit message</TooltipContent>
                  </Tooltip>
                )}

                <div
                  className={cn("flex flex-col gap-4", {
                    "bg-primary text-primary-foreground px-3 py-2 rounded-xl":
                      message.role === "user",
                  })}
                >
                  {message.role === "user" ? (
                    <Markdown>{message.content as string}</Markdown>
                  ) : !message.toolInvocations ||
                    message.toolInvocations.length === 0 ||
                    !message.toolInvocations.some((tool) =>
                      [
                        "getWeather",
                        "getTokenDetails",
                        "buyTokens",
                        "sellTokens",
                      ].includes(tool.toolName)
                    ) ? (
                    <Markdown>{message.content as string}</Markdown>
                  ) : null}
                </div>
              </div>
            )}

            {message.content && mode === "edit" && (
              <div className="flex flex-row gap-2 items-start">
                <div className="size-8" />

                <MessageEditor
                  key={message.id}
                  message={message}
                  setMode={setMode}
                  setMessages={setMessages}
                  reload={reload}
                />
              </div>
            )}

            {message.toolInvocations && message.toolInvocations.length > 0 && (
              <div className="flex flex-col gap-4">
                {message.toolInvocations.map((toolInvocation) => {
                  const { toolName, toolCallId, state, args } = toolInvocation;

                  if (state === "result") {
                    const { result } = toolInvocation;

                    return (
                      <div key={toolCallId}>
                        {toolName === "getWeather" ? (
                          <Weather weatherAtLocation={result} />
                        ) : toolName === "createDocument" ? (
                          <DocumentPreview
                            isReadonly={isReadonly}
                            result={result}
                          />
                        ) : toolName === "updateDocument" ? (
                          <DocumentToolResult
                            type="update"
                            result={result}
                            isReadonly={isReadonly}
                          />
                        ) : toolName === "requestSuggestions" ? (
                          <DocumentToolResult
                            type="request-suggestions"
                            result={result}
                            isReadonly={isReadonly}
                          />
                        ) : toolName === "getTokenDetails" ? (
                          <TokenDetails
                            token={result.token}
                            pools={result.pools}
                            events={result.events}
                            risk={result.risk}
                          />
                        ) : toolName === "buyTokens" ? (
                          <TokenBuy tokensInfo={result.tokens_info} />
                        ) : toolName === "sellTokens" ? (
                          <TokenSell tokensInfo={result.tokens_info} />
                        ) : toolName === "searchTokens" ? (
                          <TokenSearch
                            results={result.data}
                            total={result.total}
                          />
                        ) : // <pre>{JSON.stringify(result, null, 2)}</pre>
                        null}
                      </div>
                    );
                  }
                  return (
                    <div
                      key={toolCallId}
                      className={cx({
                        skeleton: ["getWeather"].includes(toolName),
                      })}
                    >
                      {toolName === "getWeather" ? (
                        <Weather />
                      ) : toolName === "createDocument" ? (
                        <DocumentPreview isReadonly={isReadonly} args={args} />
                      ) : toolName === "updateDocument" ? (
                        <DocumentToolCall
                          type="update"
                          args={args}
                          isReadonly={isReadonly}
                        />
                      ) : toolName === "requestSuggestions" ? (
                        <DocumentToolCall
                          type="request-suggestions"
                          args={args}
                          isReadonly={isReadonly}
                        />
                      ) : toolName === "getTokenDetails" ? (
                        <TokenDetailsSkeleton />
                      ) : toolName === "buyTokens" ? (
                        <TokenBuySkeleton />
                      ) : toolName === "sellTokens" ? (
                        <TokenSellSkeleton />
                      ) : toolName === "searchTokens" ? (
                        <TokenSearchSkeleton />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}

            {!isReadonly && (
              <MessageActions
                key={`action-${message.id}`}
                chatId={chatId}
                message={message}
                vote={vote}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.reasoning !== nextProps.message.reasoning)
      return false;
    if (prevProps.message.content !== nextProps.message.content) return false;
    if (
      !equal(
        prevProps.message.toolInvocations,
        nextProps.message.toolInvocations
      )
    )
      return false;
    if (!equal(prevProps.vote, nextProps.vote)) return false;

    return true;
  }
);

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          "flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
          {
            "group-data-[role=user]/message:bg-muted": true,
          }
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Thinking...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
