"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";

type FormState = { error: string };

export function AdminForm({
  action,
  cancelHref,
  submitLabel,
  children,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  cancelHref: string;
  submitLabel: string;
  children: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, { error: "" });

  return (
    <form action={formAction} className="grid gap-4">
      {state.error ? (
        <p className="rounded-lg border border-field-border bg-chip px-3 py-2 text-sm">
          {state.error}
        </p>
      ) : null}
      {children}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="h-10 rounded-full bg-ink px-5 text-sm font-medium text-background disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <a href={cancelHref} className="text-sm font-medium text-muted hover:text-ink">
          Cancel
        </a>
      </div>
    </form>
  );
}

export function DeleteButton({
  action,
  name,
}: {
  action: (formData: FormData) => void | Promise<void>;
  name: string;
}) {
  return (
    <form action={action}>
      <button
        type="submit"
        onClick={(event) => {
          if (!window.confirm(`Delete ${name}?`)) event.preventDefault();
        }}
        className="text-sm font-medium text-muted hover:text-ink"
      >
        Delete
      </button>
    </form>
  );
}
