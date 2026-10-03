"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PawIcon, PlayMark } from "@/components/icons";
import { authClient } from "@/lib/auth-client";

function safeNext(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export function LoginForm({
  nextPath,
  forbidden,
}: {
  nextPath: string;
  forbidden: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const destination = safeNext(nextPath);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const result =
      mode === "sign-in"
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ email, password, name });

    setPending(false);
    if (result.error) {
      setError(result.error.message ?? "Could not sign in.");
      return;
    }

    router.push(destination);
    router.refresh();
  }

  return (
    <main className="grid min-h-full place-items-center bg-background px-4 py-10 text-ink">
      <div className="w-full max-w-[420px]">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <PlayMark />
          <span className="flex items-center gap-1 text-[22px] font-bold tracking-tight">
            CatTube
            <PawIcon className="size-3.5" />
          </span>
        </Link>

        <div className="rounded-2xl border border-line bg-background p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
          <h1 className="text-xl font-medium">
            {mode === "sign-in" ? "Sign in" : "Create an account"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {mode === "sign-in"
              ? "Use your email and password."
              : "Choose an email and a password of at least 8 characters."}
          </p>

          {forbidden ? (
            <p className="mt-4 rounded-xl bg-chip px-3 py-2 text-sm text-ink">
              That account does not have admin access.
            </p>
          ) : null}

          <form onSubmit={onSubmit} className="mt-5 grid gap-3">
            {mode === "sign-up" ? (
              <label className="grid gap-1 text-sm">
                Name
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  className="h-10 rounded-xl border border-field-border bg-field px-3 outline-none focus:border-[#1c62b9]"
                />
              </label>
            ) : null}
            <label className="grid gap-1 text-sm">
              Email
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                className="h-10 rounded-xl border border-field-border bg-field px-3 outline-none focus:border-[#1c62b9]"
              />
            </label>
            <label className="grid gap-1 text-sm">
              Password
              <input
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                className="h-10 rounded-xl border border-field-border bg-field px-3 outline-none focus:border-[#1c62b9]"
              />
            </label>
            {error ? <p className="text-sm text-[#c00]">{error}</p> : null}
            <button
              type="submit"
              disabled={pending}
              className="mt-1 h-10 rounded-full bg-ink text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Please wait..." : mode === "sign-in" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "sign-in" ? "sign-up" : "sign-in");
              setError(null);
            }}
            className="mt-4 text-sm text-[#1c62b9] hover:underline"
          >
            {mode === "sign-in"
              ? "Need an account? Create one"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </main>
  );
}
