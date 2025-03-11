import { tool } from "ai";
import { Session } from "next-auth";
import { z } from "zod";

import crypto from "crypto";

interface getWalletsProps {
  session: Session;
}

export const getWallets = ({ session }: getWalletsProps) =>
  tool({
    description: "Get details of all user wallets",
    parameters: z.object({}),
    execute: async ({}) => {
      const userId = session.user?.email;
      const userEncryptionKey = deriveKey(session);

      let getAllWalletsResponce = "";

      if (userId && userEncryptionKey) {
        const responce = await getWalletsApi(userId, userEncryptionKey);
        getAllWalletsResponce = responce;

        return getAllWalletsResponce;
      }

      getAllWalletsResponce = `Failed to get wallets. Try again.`;
      return getAllWalletsResponce;
    },
  });

const deriveKey = (session: Session) => {
  if (!session?.user?.email) return "User ID is required for key derivation";

  const salt = process.env.ENCRYPTION_SALT || "default-salt";
  const key = crypto.pbkdf2Sync(session.user.email, salt, 100000, 32, "sha256");

  return key.toString("hex");
};

const getWalletsApi = async (userId: string, userPassword: string) => {
  try {
    const response = await fetch("http://127.0.0.1:8000/wallet/getAllWallets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, userPassword }),
    });

    if (!response.ok) {
      return `Error: ${response.status} ${response.statusText}`;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching wallets:", error);
    return error;
  }
};
