import { z } from "zod";

const ServerEnvSchema = z.object({
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
});

export const serverEnv = ServerEnvSchema.parse({
  RESEND_API_KEY: process.env.RESEND_API_KEY,
});
