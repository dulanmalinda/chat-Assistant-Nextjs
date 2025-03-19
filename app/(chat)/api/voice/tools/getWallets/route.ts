import { auth } from "@/app/(auth)/auth";
import { getWallets } from "@/lib/ai/tools/get-wallets";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const toolInstance = getWallets({ session });
    const result = await toolInstance.execute(
      {},
      {
        abortSignal: undefined,
        toolCallId: "",
        messages: [],
      }
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching session or executing tool:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
