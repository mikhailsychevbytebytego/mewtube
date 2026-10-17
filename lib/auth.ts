import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import * as authSchema from "@/drizzle/auth-schema";
import { db } from "@/lib/db";

function allowedHosts() {
  const hosts = new Set(["localhost:3000", "mewtube-five.vercel.app"]);
  for (const host of [
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ]) {
    if (host) hosts.add(host);
  }
  return [...hosts];
}

export const auth = betterAuth({
  baseURL: {
    allowedHosts: allowedHosts(),
    fallback: "http://localhost:3000",
    protocol: "auto",
  },
  advanced: {
    trustedProxyHeaders: true,
  },
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
