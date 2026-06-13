import type { Metadata } from "next";
import { hasAdminSession } from "@/lib/auth";
import { AdminPageClient } from "@/components/AdminPageClient";

export const metadata: Metadata = {
  title: "Admin — 520",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const authenticated = await hasAdminSession();
  return <AdminPageClient authenticated={authenticated} />;
}
