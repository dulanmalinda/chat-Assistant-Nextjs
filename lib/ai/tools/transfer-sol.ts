import { tool } from "ai";
import { Session } from "next-auth";
import { z } from "zod";

import crypto from "crypto";

interface transferSolProps {
  session: Session;
}

export const transferSol = ({ session }: transferSolProps) =>
  tool({
    description: "To transfer Sol",
    parameters: z.object({
      to_address: z.string(),
      amount: z.number(),
    }),
    execute: async ({ to_address, amount }) => {
      const userId = session.user?.email;
      const userEncryptionKey = deriveKey(session);

      let transferSolResponce = "";

      if (userId && userEncryptionKey) {
        const responce = await transferSolApi(
          userId,
          userEncryptionKey,
          to_address,
          amount
        );
        transferSolResponce = responce;
        return transferSolResponce;
      }

      transferSolResponce = `Failed to transfer sol. Try again.`;
      return transferSolResponce;
    },
  });

const deriveKey = (session: Session) => {
  if (!session?.user?.email)
    throw new Error("User ID is required for key derivation");

  const salt = process.env.ENCRYPTION_SALT || "default-salt";
  const key = crypto.pbkdf2Sync(session.user.email, salt, 100000, 32, "sha256");

  return key.toString("hex");
};

const transferSolApi = async (
  userId: string,
  userPassword: string,
  to_address: string,
  amount: number
) => {
  try {
    const response = await fetch("http://127.0.0.1:8000/transfer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to_address, amount, userId, userPassword }),
    });

    if (!response.ok) {
      return `Error: ${response.status} ${response.statusText}`;
    }

    return await response.json();
  } catch (error) {
    console.error("Error transfering sol:", error);
    return error;
  }
};
