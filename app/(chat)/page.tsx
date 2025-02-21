import { cookies } from "next/headers";

import { Chat } from "@/components/chat";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { generateUUID } from "@/lib/utils";
import { DataStreamHandler } from "@/components/data-stream-handler";

import { auth } from "../(auth)/auth";

export default async function Page() {
  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("chat-model");

  const session = await auth();

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl font-semibold">
          You must be logged in to access this page.
        </p>
      </div>
    );
  }

  if (!modelIdFromCookie) {
    return (
      <>
        <Chat
          key={id}
          id={id}
          initialMessages={[]}
          selectedChatModel={DEFAULT_CHAT_MODEL}
          selectedWalletName="No wallet"
          isReadonly={false}
        />
        <DataStreamHandler id={id} />
      </>
    );
  }

  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        selectedChatModel={modelIdFromCookie.value}
        selectedWalletName="No wallet"
        isReadonly={false}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
