/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { parseBankStatement } from "@/lib/bank/parser";
import { monthBounds, payrollMonthToDate } from "@/lib/data/queries";
import { uploadPrivateFile, upsertDocumentRecord } from "@/lib/storage/files";

export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (hasSupabaseEnv() && !profile) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file");
    const mappingRaw = formData.get("mapping");

    if (!(file instanceof File) || typeof mappingRaw !== "string") {
      return NextResponse.json({ ok: false, message: "File and mapping are required." }, { status: 400 });
    }

    const mapping = JSON.parse(mappingRaw) as {
      month: string;
      dateColumn: string;
      narrationColumn: string;
      referenceColumn: string;
      creditColumn?: string;
      debitColumn?: string;
      amountColumn?: string;
      balanceColumn?: string;
    };
    const buffer = await file.arrayBuffer();
    const csv = Buffer.from(buffer).toString("utf-8");
    const parsed = parseBankStatement(csv, {
      dateColumn: mapping.dateColumn,
      narrationColumn: mapping.narrationColumn,
      referenceColumn: mapping.referenceColumn,
      creditColumn: mapping.creditColumn || undefined,
      debitColumn: mapping.debitColumn || undefined,
      amountColumn: mapping.amountColumn || undefined,
      balanceColumn: mapping.balanceColumn || undefined,
    });

    if (!hasSupabaseEnv()) {
      return NextResponse.json({ ok: true, message: `${parsed.summary.importedCount} transactions parsed in demo mode.`, summary: parsed.summary });
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase || !profile) {
      return NextResponse.json({ ok: false, message: "Supabase unavailable." }, { status: 500 });
    }
    const db = supabase as any;

    const { data: profileRow } = await db.from("profiles").select("company_id").eq("id", profile.id).single();
    if (!profileRow) {
      return NextResponse.json({ ok: false, message: "Profile is not linked to a company." }, { status: 400 });
    }
    const { data: bankAccount } = await db.from("bank_accounts").select("id").eq("company_id", profileRow.company_id).eq("is_primary", true).single();
    if (!bankAccount) {
      return NextResponse.json({ ok: false, message: "Primary bank account not configured." }, { status: 400 });
    }

    const storagePath = `${mapping.month}/${Date.now()}-${file.name}`;
    await uploadPrivateFile({
      bucket: "statements",
      path: storagePath,
      contentType: file.type || "text/csv",
      body: buffer,
    });

    const { start, end } = monthBounds(mapping.month);
    const { data: importRow, error: importError } = await db
      .from("bank_imports")
      .insert({
        company_id: profileRow.company_id,
        bank_account_id: bankAccount.id,
        source_filename: file.name,
        storage_path: storagePath,
        imported_by: profile.id,
        import_month: payrollMonthToDate(mapping.month),
        row_count: parsed.summary.rowCount,
        deduplicated_count: parsed.summary.duplicateCount,
        period_start: start,
        period_end: end,
      })
      .select("id")
      .single();

    if (importError || !importRow) {
      return NextResponse.json({ ok: false, message: importError?.message ?? "Unable to save import batch." }, { status: 500 });
    }

    if (parsed.transactions.length > 0) {
      const { error: transactionError } = await db.from("bank_transactions").upsert(
        parsed.transactions.map((txn) => ({
          company_id: profileRow.company_id,
          bank_account_id: bankAccount.id,
          bank_import_id: importRow.id,
          posted_at: txn.postedAt,
          narration: txn.narration,
          normalized_narration: txn.normalizedNarration,
          reference_number: txn.referenceNumber,
          direction: txn.direction,
          amount: txn.amount,
          balance: txn.balance,
          transaction_type: txn.type,
          duplicate_fingerprint: txn.duplicateKey,
        })),
        { onConflict: "company_id,duplicate_fingerprint", ignoreDuplicates: true },
      );

      if (transactionError) {
        return NextResponse.json({ ok: false, message: transactionError.message }, { status: 500 });
      }
    }

    await upsertDocumentRecord({
      companyId: profileRow.company_id,
      linkedEntity: "bank_import",
      linkedId: importRow.id,
      documentKind: "statement",
      fileName: file.name,
      storagePath,
      mimeType: file.type || "text/csv",
      sizeBytes: buffer.byteLength,
      uploadedBy: profile.id,
    });

    await db.from("audit_logs").insert({
      company_id: profileRow.company_id,
      actor_profile_id: profile.id,
      action: "bank.import.created",
      entity_type: "bank_import",
      entity_id: importRow.id,
      diff_summary: `Imported ${file.name}`,
      diff: {
        month: mapping.month,
        rowCount: parsed.summary.rowCount,
        importedCount: parsed.summary.importedCount,
      },
    });

    return NextResponse.json({ ok: true, message: `${parsed.summary.importedCount} transactions imported.`, summary: parsed.summary });
  }

  const body = await request.json();
  const parsed = parseBankStatement(body.csv, body.mapping);
  return NextResponse.json({ ok: true, ...parsed });
}
