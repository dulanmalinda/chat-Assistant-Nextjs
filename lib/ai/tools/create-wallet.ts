import { tool } from "ai";
import { Session } from "next-auth";
import { z } from "zod";

import crypto from "crypto";

interface createWalletProps {
  session: Session;
}

export const createWallet = ({ session }: createWalletProps) =>
  tool({
    description: "To create a new wallet",
    parameters: z.object({
      wallet_name: z.string(),
    }),
    execute: async ({ wallet_name }) => {
      const userId = session.user?.email;
      const userEncryptionKey = deriveKey(session);

      let walletCreationResponce = "";

      if (userId && userEncryptionKey) {
        const responce = await createWalletApi(
          userId,
          userEncryptionKey,
          wallet_name
        );
        walletCreationResponce = `Successful wallet creation: ${responce.pubkey}`;
        return walletCreationResponce;
      }

      walletCreationResponce = `Failed to create wallet. Try again.`;
      return walletCreationResponce;
    },
  });

const deriveKey = (session: Session) => {
  if (!session?.user?.email)
    throw new Error("User ID is required for key derivation");

  const salt = process.env.ENCRYPTION_SALT || "default-salt";
  const key = crypto.pbkdf2Sync(session.user.email, salt, 100000, 32, "sha256");

  return key.toString("hex");
};

const createWalletApi = async (
  userId: string,
  userPassword: string,
  wallet_name: string
) => {
  try {
    const response = await fetch("http://127.0.0.1:8000/wallet/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, userPassword, wallet_name }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating wallet:", error);
    throw error;
  }
};
