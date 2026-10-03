import type { Metadata } from "next";
import { AdminScreen } from "@/components/admin-screen";
import { adminError, getAdminData, isAdminType } from "@/lib/admin";
import { requireAdmin } from "@/lib/require-admin";

export const metadata: Metadata = {
  title: "Admin - CatTube",
};

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams: Promise<{ type?: string; edit?: string; error?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const type = isAdminType(params.type) ? params.type : "users";
  const data = await getAdminData();

  return (
    <AdminScreen
      type={type}
      edit={params.edit ?? null}
      notice={adminError(type, params.error)}
      data={data}
    />
  );
}
