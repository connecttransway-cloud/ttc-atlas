import { getDashboardData } from "@/lib/data/queries";
import { buildCaExportZip } from "@/lib/exports/ca-export";
import { getCurrentProfile } from "@/lib/auth/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: Promise<{ month: string }> }) {
  const profile = await getCurrentProfile();
  if (hasSupabaseEnv() && !profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { month } = await params;
  const data = await getDashboardData();
  const zip = await buildCaExportZip(data, month);
  const body = new Uint8Array(zip.byteLength);
  body.set(zip);

  return new Response(body, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="ca-export-${month}.zip"`,
    },
  });
}
