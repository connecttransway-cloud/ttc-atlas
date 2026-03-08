/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function uploadPrivateFile(params: {
  bucket: "statements" | "documents" | "payslips" | "invoices";
  path: string;
  contentType: string;
  body: ArrayBuffer | Uint8Array | Buffer;
}) {
  const supabase = await createServiceRoleClient();
  if (!supabase) return null;
  const admin = supabase as any;

  const payload = params.body instanceof Uint8Array ? params.body : new Uint8Array(params.body);

  const { error } = await admin.storage.from(params.bucket).upload(params.path, payload, {
    contentType: params.contentType,
    upsert: true,
  });

  if (error) {
    throw error;
  }

  return params.path;
}

export async function downloadPrivateFile(bucket: "statements" | "documents" | "payslips" | "invoices", path: string) {
  const supabase = await createServiceRoleClient();
  if (!supabase) return null;
  const admin = supabase as any;

  const { data, error } = await admin.storage.from(bucket).download(path);
  if (error || !data) return null;
  return new Uint8Array(await data.arrayBuffer());
}

export async function upsertDocumentRecord(params: {
  companyId: string;
  linkedEntity: string;
  linkedId: string;
  documentKind: "statement" | "invoice" | "expense_proof" | "payslip" | "other";
  fileName: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy?: string | null;
}) {
  const supabase = await createServiceRoleClient();
  if (!supabase) return null;
  const admin = supabase as any;

  const { data: existing } = await admin
    .from("documents")
    .select("id")
    .eq("company_id", params.companyId)
    .eq("linked_entity", params.linkedEntity)
    .eq("linked_id", params.linkedId)
    .eq("document_kind", params.documentKind)
    .maybeSingle();

  if (existing) {
    const { data, error } = await admin
      .from("documents")
      .update({
        file_name: params.fileName,
        storage_path: params.storagePath,
        mime_type: params.mimeType,
        size_bytes: params.sizeBytes,
        uploaded_by: params.uploadedBy ?? null,
      })
      .eq("id", existing.id)
      .select("id")
      .single();
    if (error) throw error;
    return data.id;
  }

  const { data, error } = await admin
    .from("documents")
    .insert({
      company_id: params.companyId,
      document_kind: params.documentKind,
      file_name: params.fileName,
      storage_path: params.storagePath,
      mime_type: params.mimeType,
      size_bytes: params.sizeBytes,
      linked_entity: params.linkedEntity,
      linked_id: params.linkedId,
      uploaded_by: params.uploadedBy ?? null,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}
