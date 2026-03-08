/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { getDashboardData } from "@/lib/data/queries";
import { renderPayslipPdf } from "@/lib/pdf/render";
import { uploadPrivateFile, upsertDocumentRecord } from "@/lib/storage/files";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function GET(_: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const profile = await getCurrentProfile();
  if (hasSupabaseEnv() && !profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemId } = await params;
  const data = await getDashboardData();
  const item = data.payrollItems.find((entry) => entry.id === itemId);

  if (!item) {
    return NextResponse.json({ error: "Payslip item not found" }, { status: 404 });
  }

  const employee = data.employees.find((entry) => entry.id === item.employeeId);
  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  const pdf = await renderPayslipPdf(data.company, employee, item);
  const body = new Uint8Array(pdf.byteLength);
  body.set(pdf);

  if (hasSupabaseEnv()) {
    const storagePath = `${item.month}/${employee.employeeCode}.pdf`;
    await uploadPrivateFile({
      bucket: "payslips",
      path: storagePath,
      contentType: "application/pdf",
      body,
    });

    const documentId = await upsertDocumentRecord({
      companyId: data.company.id,
      linkedEntity: "payroll_item",
      linkedId: item.id,
      documentKind: "payslip",
      fileName: `${employee.employeeCode}-${item.month}.pdf`,
      storagePath,
      mimeType: "application/pdf",
      sizeBytes: body.byteLength,
      uploadedBy: profile?.id ?? null,
    });

    const serviceRole = await createServiceRoleClient();
    if (serviceRole && documentId) {
      const admin = serviceRole as any;
      await admin.from("payroll_items").update({ payslip_document_id: documentId }).eq("id", item.id);
    }
  }

  return new Response(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${employee.employeeCode}-${item.month}.pdf"`,
    },
  });
}
