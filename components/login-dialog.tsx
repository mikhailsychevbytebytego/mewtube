"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function LoginDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

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

    router.refresh();
    onSuccess();
  }

  return createPortal(
    <div
      className="grid place-items-center bg-black/50 p-4"
      style={{ position: "fixed", inset: 0, zIndex: 80 }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-dialog-title"
        className="w-full max-w-[420px] rounded-2xl bg-background p-6 text-ink shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="login-dialog-title" className="text-xl font-medium">
              {mode === "sign-in" ? "Sign in" : "Create an account"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {mode === "sign-in"
                ? "Sign in to subscribe to this channel."
                : "Choose an email and a password of at least 8 characters."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-full text-xl leading-none hover:bg-chip"
          >
            ×
          </button>
        </div>

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
              autoFocus
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
          {mode === "sign-in" ? "Need an account? Create one" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>,
    document.body,
  );
}
