import { z } from "zod";

const EnvSchema = z.object({
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  SITE_URL: z.string().url().default("https://divijganjoo.me").or(z.undefined()),
});

export const env = EnvSchema.parse({
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  SITE_URL: process.env.SITE_URL || "https://divijganjoo.me",
});
