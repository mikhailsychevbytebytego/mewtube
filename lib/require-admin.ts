import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function getCurrentSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireUser(nextPath = "/studio") {
  const session = await getCurrentSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return session;
}

export async function adminSession() {
  const session = await getCurrentSession();
  if (!session || session.user.admin !== true) return null;
  return session;
}

export async function requireAdmin() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login?next=/admin");
  }

  if (session.user.admin !== true) {
    redirect("/login?error=forbidden");
  }

  return session;
}
