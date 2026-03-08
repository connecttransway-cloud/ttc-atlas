/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { getDashboardData } from "@/lib/data/queries";
import { renderInvoicePdf } from "@/lib/pdf/render";
import { uploadPrivateFile, upsertDocumentRecord } from "@/lib/storage/files";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function GET(_: Request, { params }: { params: Promise<{ invoiceId: string }> }) {
  const profile = await getCurrentProfile();
  if (hasSupabaseEnv() && !profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { invoiceId } = await params;
  const data = await getDashboardData();
  const invoice = data.invoices.find((entry) => entry.id === invoiceId);

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const pdf = await renderInvoicePdf(data.company, invoice);
  const body = new Uint8Array(pdf.byteLength);
  body.set(pdf);

  if (hasSupabaseEnv()) {
    const storagePath = `${invoice.issueDate.slice(0, 7)}/${invoice.invoiceNumber}.pdf`;
    await uploadPrivateFile({
      bucket: "invoices",
      path: storagePath,
      contentType: "application/pdf",
      body,
    });

    const documentId = await upsertDocumentRecord({
      companyId: data.company.id,
      linkedEntity: "invoice",
      linkedId: invoice.id,
      documentKind: "invoice",
      fileName: `${invoice.invoiceNumber}.pdf`,
      storagePath,
      mimeType: "application/pdf",
      sizeBytes: body.byteLength,
      uploadedBy: profile?.id ?? null,
    });

    const serviceRole = await createServiceRoleClient();
    if (serviceRole && documentId) {
      const admin = serviceRole as any;
      await admin.from("invoices").update({ pdf_document_id: documentId }).eq("id", invoice.id);
    }
  }

  return new Response(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.invoiceNumber}.pdf"`,
    },
  });
}
