import {
  type Message,
  createDataStreamResponse,
  smoothStream,
  streamText,
} from "ai";

import { auth } from "@/app/(auth)/auth";
import { myProvider } from "@/lib/ai/models";
import { systemPrompt } from "@/lib/ai/prompts";
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
} from "@/lib/db/queries";
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from "@/lib/utils";

import { generateTitleFromUserMessage } from "../../actions";
import { createDocument } from "@/lib/ai/tools/create-document";
import { updateDocument } from "@/lib/ai/tools/update-document";
import { requestSuggestions } from "@/lib/ai/tools/request-suggestions";
import { getWeather } from "@/lib/ai/tools/get-weather";

import { createWallet } from "@/lib/ai/tools/create-wallet";
import { getWallets } from "@/lib/ai/tools/get-wallets";
import { setActiveWallet, getActiveWallet } from "@/lib/ai/tools/active-wallet";
import { checkWalletBalance } from "@/lib/ai/tools/wallet-balance";
import { transferSol } from "@/lib/ai/tools/transfer-sol";
import { transferTokens } from "@/lib/ai/tools/transfer-tokens";
import { buyTokens } from "@/lib/ai/tools/buy-tokens";
import { sellTokens } from "@/lib/ai/tools/sell-tokens";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const {
      id,
      messages,
      selectedChatModel,
    }: { id: string; messages: Array<Message>; selectedChatModel: string } =
      await request.json();

    const session = await auth();

    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userMessage = getMostRecentUserMessage(messages);

    if (!userMessage) {
      return new Response("No user message found", { status: 400 });
    }

    let chat = await getChatById({ id });

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message: userMessage,
      });

      chat = await saveChat({ id, userId: session.user.email, title });
    }

    await saveMessages({
      messages: [
        {
          id: generateUUID(),
          chatId: id,
          role: userMessage.role,
          content: userMessage.content,
          createdAt: new Date(),
        },
      ],
    });

    return createDataStreamResponse({
      execute: (dataStream) => {
        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: systemPrompt({ selectedChatModel }),
          messages,
          maxSteps: 5,
          // experimental_activeTools:
          //   selectedChatModel === "chat-model-reasoning"
          //     ? []
          //     : [
          //         "getWeather",
          //         "createDocument",
          //         "updateDocument",
          //         "requestSuggestions",
          //         "createWallet",
          //         "getWallets",
          //         "setActiveWallet",
          //         "getActiveWallet",
          //       ],
          // experimental_transform: smoothStream({ chunking: "word" }),
          // experimental_generateMessageId: generateUUID,
          tools: {
            getWeather,
            // createDocument: createDocument({ session, dataStream }),
            // updateDocument: updateDocument({ session, dataStream }),
            // requestSuggestions: requestSuggestions({
            //   session,
            //   dataStream,
            // }),
            createWallet: createWallet({
              session,
            }),
            getWallets: getWallets({
              session,
            }),
            setActiveWallet: setActiveWallet({
              session,
            }),
            getActiveWallet: getActiveWallet({
              session,
            }),
            checkWalletBalance: checkWalletBalance({
              session,
            }),
            transferSol: transferSol({
              session,
            }),
            transferTokens: transferTokens({
              session,
            }),
            buyTokens: buyTokens({
              session,
            }),
            sellTokens: sellTokens({
              session,
            }),
          },
          onFinish: async ({ response, reasoning }) => {
            if (session.user?.email) {
              try {
                const sanitizedResponseMessages = sanitizeResponseMessages({
                  messages: response.messages,
                  reasoning,
                });

                await saveMessages({
                  messages: sanitizedResponseMessages
                    .filter(
                      (message) =>
                        !(
                          Array.isArray(message.content) &&
                          message.content.some(
                            (item) =>
                              item.type === "tool-call" ||
                              item.type === "tool-result"
                          )
                        )
                    ) // Exclude tool-call and tool-result messages
                    .map((message) => ({
                      id: generateUUID(),
                      chatId: id,
                      role: message.role,
                      content:
                        typeof message.content === "string"
                          ? message.content
                          : Array.isArray(message.content)
                          ? message.content
                              .filter(
                                (item) =>
                                  item.type !== "tool-call" &&
                                  item.type !== "tool-result"
                              ) // Exclude unwanted types
                              .map((item) =>
                                "text" in item
                                  ? item.text
                                  : JSON.stringify(item)
                              ) // Extract text if available
                              .join(" ")
                          : JSON.stringify(message.content),
                      createdAt: new Date(),
                    })),
                });
              } catch (error) {
                console.error("Failed to save chat messages:", error);
              }
            }
          },
          experimental_telemetry: {
            isEnabled: true,
            functionId: "stream-text",
          },
        });

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      },
      onError: () => {
        return "Oops, an error occurred!";
      },
    });
  } catch (error) {
    console.error("Error in POST:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response("Not Found", { status: 404 });
    }

    const session = await auth();

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const chat = await getChatById({ id });

    if (!chat) {
      return new Response("Chat not found", { status: 404 });
    }

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 403 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    console.error("Error in DELETE:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
