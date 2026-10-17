import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

async function currentSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function adminSession() {
  const session = await currentSession();
  if (!session || session.user.admin !== true) return null;
  return session;
}

export async function requireAdmin() {
  const session = await currentSession();

  if (!session) {
    redirect("/login?next=/admin");
  }

  if (session.user.admin !== true) {
    redirect("/login?error=forbidden");
  }

  return session;
}
