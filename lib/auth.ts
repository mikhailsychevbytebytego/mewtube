import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import * as authSchema from "@/drizzle/auth-schema";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      admin: {
        type: "boolean",
        required: true,
        defaultValue: false,
        input: false,
      },
    },
  },
  plugins: [nextCookies()],
});
