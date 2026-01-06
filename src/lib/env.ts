import { z } from "zod";

const EnvSchema = z.object({
  SITE_URL: z.string().url().default("https://divijganjoo.me").or(z.undefined()),
});

export const env = EnvSchema.parse({
  SITE_URL: process.env.SITE_URL || "https://divijganjoo.me",
});
