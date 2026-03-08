import { headers } from "next/headers";
import { AppShell } from "@/components/layout/app-shell";
import { requireProfile } from "@/lib/auth/server";
import { getDashboardData } from "@/lib/data/queries";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? "/dashboard";
  const currentProfile = await requireProfile();
  const data = await getDashboardData();

  return <AppShell currentPath={pathname} profile={currentProfile ?? data.profile}>{children}</AppShell>;
}
