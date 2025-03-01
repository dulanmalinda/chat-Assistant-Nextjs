import { tool } from "ai";
import { Session } from "next-auth";
import { z } from "zod";

import crypto from "crypto";

interface getWalletsProps {
  session: Session;
}

interface setWalletsProps {
  session: Session;
}

export const getActiveWallet = ({ session }: getWalletsProps) =>
  tool({
    description:
      "Get active wallet details of the user. including wallet name, address, mnemonic and private key",
    parameters: z.object({}),
    execute: async ({}) => {
      const userId = session.user?.email;
      const userEncryptionKey = deriveKey(session);

      let getActiveWalletResponce = "";
      if (userId && userEncryptionKey) {
        const responce = await getActiveWalletApi(userId, userEncryptionKey);
        getActiveWalletResponce = responce;
        return getActiveWalletResponce;
      }

      getActiveWalletResponce = `Failed to get wallets. Try again.`;
      return getActiveWalletResponce;
    },
  });

export const setActiveWallet = ({ session }: setWalletsProps) =>
  tool({
    description: "Set active wallet",
    parameters: z.object({
      wallet_name: z.string(),
    }),
    execute: async ({ wallet_name }) => {
      const userId = session.user?.email;
      const userEncryptionKey = deriveKey(session);

      let setActiveWalletResponce = "";

      if (userId && userEncryptionKey) {
        const responce = await setActiveWalletApi(
          userId,
          userEncryptionKey,
          wallet_name
        );
        setActiveWalletResponce = responce;
        return setActiveWalletResponce;
      }

      setActiveWalletResponce = `Failed to set wallet. Try again.`;
      return setActiveWalletResponce;
    },
  });

const deriveKey = (session: Session) => {
  if (!session?.user?.email)
    throw new Error("User ID is required for key derivation");

  const salt = process.env.ENCRYPTION_SALT || "default-salt";
  const key = crypto.pbkdf2Sync(session.user.email, salt, 100000, 32, "sha256");

  return key.toString("hex");
};

const getActiveWalletApi = async (userId: string, userPassword: string) => {
  try {
    const response = await fetch(
      "http://127.0.0.1:8000/wallet/getActiveWallet",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, userPassword }),
      }
    );

    if (!response.ok) {
      return `Error: ${response.status} ${response.statusText}`;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching wallet data:", error);
    return error;
  }
};

const setActiveWalletApi = async (
  userId: string,
  userPassword: string,
  wallet_name: string
) => {
  try {
    console.log(wallet_name);

    const response = await fetch(
      "http://127.0.0.1:8000/wallet/setActiveWallet",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, userPassword, wallet_name }),
      }
    );

    if (!response.ok) {
      return `Error: ${response.status} ${response.statusText}`;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching wallets:", error);
    return error;
  }
};
