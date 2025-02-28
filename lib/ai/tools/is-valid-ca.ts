import { tool } from "ai";
import { z } from "zod";

import { isValidSolanaAddress } from "@/lib/utils";

export const isValidCA = () =>
  tool({
    description:
      "Checks whether the provided contract address is valid. If not, try searching.",
    parameters: z.object({
      address: z.string(),
    }),
    execute: async ({ address }) => {
      if (!isValidSolanaAddress(address)) {
        return "False";
      }

      return "True";
    },
  });
