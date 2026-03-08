/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";
import { buildPayrollRun, getPayrollValidationIssues, PayrollValidationError } from "@/lib/payroll/engine";
import { parseBankStatement } from "@/lib/bank/parser";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { assertRole, requireProfile } from "@/lib/auth/server";
import { calculateInvoiceTotals, getDashboardData, monthBounds, payrollMonthToDate } from "@/lib/data/queries";
import { uploadPrivateFile } from "@/lib/storage/files";
import { employeeSchema, invoiceSchema, salaryStructureSchema, type BankImportFormValues, type EmployeeFormValues, type InvoiceFormValues, type SalaryStructureFormValues, type VendorFormValues, vendorSchema } from "@/lib/validation/schemas";
import type { PayrollStatus } from "@/lib/types/domain";

function maskAccountNumber(value: string) {
  const trimmed = value.replace(/\s+/g, "");
  const visible = trimmed.slice(-4);
  return `${"X".repeat(Math.max(0, trimmed.length - 4))}${visible}`;
}

async function insertAuditLog(companyId: string, actorId: string, action: string, entityType: string, entityId: string, diffSummary: string, diff: Record<string, unknown>) {
  const supabase = await createServiceRoleClient();
  if (!supabase) return;
  const db = supabase as any;

  await db.from("audit_logs").insert({
    company_id: companyId,
    actor_profile_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    diff_summary: diffSummary,
    diff,
  });
}

export async function saveEmployeeAction(values: EmployeeFormValues & { id?: string }) {
  const profile = await requireProfile();
  if (!profile || !hasSupabaseEnv()) return { ok: false, message: "Supabase is not configured." };
  assertRole(["admin", "payroll_operator"], profile.role);

  const parsed = employeeSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "Invalid employee data." };

  const supabase = await createServiceRoleClient();
  if (!supabase) return { ok: false, message: "Supabase unavailable." };
  const db = supabase as any;

  const { data: profileRow } = await db.from("profiles").select("company_id").eq("id", profile.id).single();
  if (!profileRow) return { ok: false, message: "Profile is not linked to a company." };
  const payload = {
    company_id: profileRow.company_id,
    employee_code: parsed.data.employeeCode,
    full_name: parsed.data.fullName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    designation: parsed.data.designation,
    department: parsed.data.department,
    location: parsed.data.location,
    join_date: parsed.data.joinDate,
    leave_date: parsed.data.leaveDate || null,
    pan: parsed.data.pan,
    uan: parsed.data.uan || null,
    pf_eligible: parsed.data.pfEligible,
    bank_account_name: parsed.data.bankAccountName,
    bank_account_number_masked: maskAccountNumber(parsed.data.bankAccountNumber),
    bank_ifsc: parsed.data.bankIfsc,
    status: parsed.data.status,
  };

  const query = values.id
    ? db.from("employees").update(payload).eq("id", values.id).select("id").single()
    : db.from("employees").insert(payload).select("id").single();

  const { data, error } = await query;
  if (error || !data) return { ok: false, message: error?.message ?? "Unable to save employee." };

  await insertAuditLog(profileRow.company_id, profile.id, values.id ? "employee.updated" : "employee.created", "employee", data.id, `${parsed.data.fullName} saved`, parsed.data);
  revalidatePath("/employees");
  revalidatePath("/payroll");
  return { ok: true, message: values.id ? "Employee updated." : "Employee created." };
}

export async function saveSalaryStructureAction(employeeId: string, values: SalaryStructureFormValues & { id?: string }) {
  const profile = await requireProfile();
  if (!profile || !hasSupabaseEnv()) return { ok: false, message: "Supabase is not configured." };
  assertRole(["admin", "payroll_operator"], profile.role);

  const parsed = salaryStructureSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "Invalid salary structure." };

  const supabase = await createServiceRoleClient();
  if (!supabase) return { ok: false, message: "Supabase unavailable." };
  const db = supabase as any;
  const { data: profileRow } = await db.from("profiles").select("company_id").eq("id", profile.id).single();
  if (!profileRow) return { ok: false, message: "Profile is not linked to a company." };

  const payload = {
    company_id: profileRow.company_id,
    employee_id: employeeId,
    effective_date: parsed.data.effectiveDate,
    monthly_basic: parsed.data.basic,
    hra: parsed.data.hra,
    special_allowance: parsed.data.specialAllowance,
    fixed_allowance: parsed.data.fixedAllowance,
    other_fixed_earnings: parsed.data.otherFixedEarnings,
    employee_pf_enabled: parsed.data.employeePfEnabled,
    employer_pf_enabled: parsed.data.employerPfEnabled,
    professional_tax_enabled: parsed.data.professionalTaxEnabled,
    tds_enabled: parsed.data.tdsEnabled,
  };

  const query = values.id
    ? db.from("salary_structures").update(payload).eq("id", values.id).select("id").single()
    : db.from("salary_structures").insert(payload).select("id").single();

  const { data, error } = await query;
  if (error || !data) return { ok: false, message: error?.message ?? "Unable to save salary structure." };

  await insertAuditLog(profileRow.company_id, profile.id, values.id ? "salary_structure.updated" : "salary_structure.created", "salary_structure", data.id, "Salary structure saved", parsed.data);
  revalidatePath("/employees");
  revalidatePath("/payroll");
  return { ok: true, message: "Salary structure saved." };
}

export async function saveVendorAction(values: VendorFormValues & { id?: string }) {
  const profile = await requireProfile();
  if (!profile || !hasSupabaseEnv()) return { ok: false, message: "Supabase is not configured." };
  assertRole(["admin", "finance_operator"], profile.role);

  const parsed = vendorSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "Invalid vendor data." };

  const supabase = await createServiceRoleClient();
  if (!supabase) return { ok: false, message: "Supabase unavailable." };
  const db = supabase as any;
  const { data: profileRow } = await db.from("profiles").select("company_id").eq("id", profile.id).single();
  if (!profileRow) return { ok: false, message: "Profile is not linked to a company." };

  const payload = {
    company_id: profileRow.company_id,
    name: parsed.data.name,
    kind: parsed.data.kind,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
    gstin: parsed.data.gstin || null,
    pan: parsed.data.pan || null,
    default_category_id: parsed.data.defaultCategoryId,
    tds_applicable: parsed.data.tdsApplicable,
    active: parsed.data.active,
  };

  const query = values.id
    ? db.from("vendors").update(payload).eq("id", values.id).select("id").single()
    : db.from("vendors").insert(payload).select("id").single();

  const { data, error } = await query;
  if (error || !data) return { ok: false, message: error?.message ?? "Unable to save vendor." };

  await insertAuditLog(profileRow.company_id, profile.id, values.id ? "vendor.updated" : "vendor.created", "vendor", data.id, `${parsed.data.name} saved`, parsed.data);
  revalidatePath("/vendors");
  revalidatePath("/bank");
  return { ok: true, message: values.id ? "Vendor updated." : "Vendor created." };
}

export async function saveInvoiceAction(values: InvoiceFormValues & { id?: string }) {
  const profile = await requireProfile();
  if (!profile || !hasSupabaseEnv()) return { ok: false, message: "Supabase is not configured." };
  assertRole(["admin", "finance_operator"], profile.role);

  const parsed = invoiceSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "Invalid invoice data." };

  const supabase = await createServiceRoleClient();
  if (!supabase) return { ok: false, message: "Supabase unavailable." };
  const db = supabase as any;
  const { data: profileRow } = await db.from("profiles").select("company_id").eq("id", profile.id).single();
  if (!profileRow) return { ok: false, message: "Profile is not linked to a company." };
  const totals = calculateInvoiceTotals(parsed.data.lineItems);

  let invoiceId = values.id;
  if (values.id) {
    const { error } = await db
      .from("invoices")
      .update({
        invoice_number: parsed.data.invoiceNumber,
        issue_date: parsed.data.issueDate,
        due_date: parsed.data.dueDate,
        customer_name: parsed.data.customerName,
        customer_address: parsed.data.customerAddress,
        gstin: parsed.data.gstin || null,
        notes: parsed.data.notes || null,
        status: parsed.data.status,
        subtotal: totals.subtotal,
        tax_total: totals.taxTotal,
        grand_total: totals.grandTotal,
      })
      .eq("id", values.id);
    if (error) return { ok: false, message: error.message };
    await db.from("invoice_line_items").delete().eq("invoice_id", values.id);
  } else {
    const { data, error } = await db
      .from("invoices")
      .insert({
        company_id: profileRow.company_id,
        invoice_number: parsed.data.invoiceNumber,
        issue_date: parsed.data.issueDate,
        due_date: parsed.data.dueDate,
        customer_name: parsed.data.customerName,
        customer_address: parsed.data.customerAddress,
        gstin: parsed.data.gstin || null,
        notes: parsed.data.notes || null,
        status: parsed.data.status,
        subtotal: totals.subtotal,
        tax_total: totals.taxTotal,
        grand_total: totals.grandTotal,
        created_by: profile.id,
      })
      .select("id")
      .single();
    if (error || !data) return { ok: false, message: error?.message ?? "Unable to create invoice." };
    invoiceId = data.id;
  }

  if (!invoiceId) return { ok: false, message: "Invoice id missing." };

  const { error: lineError } = await db.from("invoice_line_items").insert(
    parsed.data.lineItems.map((item, index) => ({
      invoice_id: invoiceId,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      tax_percent: item.taxPercent,
      sort_order: index,
    })),
  );
  if (lineError) return { ok: false, message: lineError.message };

  await insertAuditLog(profileRow.company_id, profile.id, values.id ? "invoice.updated" : "invoice.created", "invoice", invoiceId, `${parsed.data.invoiceNumber} saved`, parsed.data);
  revalidatePath("/invoices");
  return { ok: true, message: values.id ? "Invoice updated." : "Invoice created." };
}

export async function recalculatePayrollRunAction(month: string) {
  const profile = await requireProfile();
  if (!profile || !hasSupabaseEnv()) return { ok: false, message: "Supabase is not configured." };
  assertRole(["admin", "payroll_operator"], profile.role);

  const supabase = await createServiceRoleClient();
  if (!supabase) return { ok: false, message: "Supabase unavailable." };
  const db = supabase as any;
  const { data: profileRow } = await db.from("profiles").select("company_id").eq("id", profile.id).single();
  if (!profileRow) return { ok: false, message: "Profile is not linked to a company." };
  const data = await getDashboardData();

  const existingRun = data.payrollRuns.find((entry) => entry.month === month);
  if (existingRun?.status === "locked") {
    return { ok: false, message: "Locked payroll month cannot be recalculated." };
  }

  const validationIssues = getPayrollValidationIssues({
    month,
    employees: data.employees,
    salaryStructures: data.salaryStructures,
  });
  if (validationIssues.length > 0) {
    return {
      ok: false,
      message: `Add salary structure for ${validationIssues.map((issue) => issue.employeeCode).join(", ")} before recalculating payroll.`,
    };
  }

  let computation;
  try {
    computation = buildPayrollRun({
      month,
      employees: data.employees,
      salaryStructures: data.salaryStructures,
      adjustments: data.payrollAdjustments.filter((entry) => entry.month === month),
      attendance: Object.fromEntries(
        data.payrollItems.filter((entry) => entry.month === month).map((entry) => [entry.employeeId, { paidDays: entry.paidDays, lopDays: entry.lopDays }]),
      ),
    });
  } catch (error) {
    if (error instanceof PayrollValidationError) {
      return {
        ok: false,
        message: `Add salary structure for ${error.issues.map((issue) => issue.employeeCode).join(", ")} before recalculating payroll.`,
      };
    }
    throw error;
  }

  const runPayload = {
    company_id: profileRow.company_id,
    payroll_month: payrollMonthToDate(month),
    status: existingRun?.status ?? ("draft" as PayrollStatus),
    total_employees: computation.totals.totalEmployees,
    total_gross: computation.totals.totalGross,
    total_net: computation.totals.totalNet,
    total_employer_cost: computation.totals.totalEmployerCost,
  };

  const { data: runRow, error: runError } = existingRun
    ? await db.from("payroll_runs").update(runPayload).eq("id", existingRun.id).select("id").single()
    : await db.from("payroll_runs").insert(runPayload).select("id").single();

  if (runError || !runRow) return { ok: false, message: runError?.message ?? "Unable to save payroll run." };

  await db.from("payroll_items").delete().eq("payroll_run_id", runRow.id);
  const { error: itemsError } = await db.from("payroll_items").insert(
    computation.items.map((item) => ({
      company_id: profileRow.company_id,
      payroll_run_id: runRow.id,
      employee_id: item.employeeId,
      payroll_month: payrollMonthToDate(month),
      paid_days: item.paidDays,
      lop_days: item.lopDays,
      gross_pay: item.grossPay,
      employee_pf: item.employeePf,
      employer_pf: item.employerPf,
      professional_tax: item.professionalTax,
      tds: item.tds,
      other_deductions: item.otherDeductions,
      reimbursements: item.reimbursements,
      net_pay: item.netPay,
      calc_snapshot: item.calcSnapshot,
    })),
  );

  if (itemsError) return { ok: false, message: itemsError.message };

  await insertAuditLog(profileRow.company_id, profile.id, "payroll.run.recalculated", "payroll_run", runRow.id, `Payroll recalculated for ${month}`, { month, totals: computation.totals });
  revalidatePath("/payroll");
  revalidatePath("/dashboard");
  return { ok: true, message: `Payroll recalculated for ${month}.` };
}

export async function lockPayrollRunAction(month: string) {
  const profile = await requireProfile();
  if (!profile || !hasSupabaseEnv()) return { ok: false, message: "Supabase is not configured." };
  assertRole(["admin", "payroll_operator"], profile.role);

  const supabase = await createServiceRoleClient();
  if (!supabase) return { ok: false, message: "Supabase unavailable." };
  const db = supabase as any;
  const { data: profileRow } = await db.from("profiles").select("company_id").eq("id", profile.id).single();
  if (!profileRow) return { ok: false, message: "Profile is not linked to a company." };

  const { data: runRow, error } = await db
    .from("payroll_runs")
    .update({ status: "locked", locked_at: new Date().toISOString(), locked_by: profile.id })
    .eq("company_id", profileRow.company_id)
    .eq("payroll_month", payrollMonthToDate(month))
    .select("id")
    .single();

  if (error || !runRow) return { ok: false, message: error?.message ?? "Unable to lock payroll month." };

  await insertAuditLog(profileRow.company_id, profile.id, "payroll.run.locked", "payroll_run", runRow.id, `Locked payroll month ${month}`, { month });
  revalidatePath("/payroll");
  revalidatePath("/dashboard");
  return { ok: true, message: `Payroll month ${month} locked.` };
}

export async function importBankStatementAction(params: {
  fileName: string;
  fileBuffer: ArrayBuffer;
  form: BankImportFormValues;
}) {
  const profile = await requireProfile();
  if (!profile || !hasSupabaseEnv()) return { ok: false, message: "Supabase is not configured." };
  assertRole(["admin", "finance_operator"], profile.role);

  const supabase = await createServiceRoleClient();
  if (!supabase) return { ok: false, message: "Supabase unavailable." };
  const db = supabase as any;

  const { data: profileRow } = await db.from("profiles").select("company_id").eq("id", profile.id).single();
  if (!profileRow) return { ok: false, message: "Profile is not linked to a company." };
  const { data: bankAccount } = await db.from("bank_accounts").select("id").eq("company_id", profileRow.company_id).eq("is_primary", true).single();
  if (!bankAccount) return { ok: false, message: "Primary bank account not configured." };

  const csv = Buffer.from(params.fileBuffer).toString("utf-8");
  const parsed = parseBankStatement(csv, {
    dateColumn: params.form.dateColumn,
    narrationColumn: params.form.narrationColumn,
    referenceColumn: params.form.referenceColumn,
    creditColumn: params.form.creditColumn || undefined,
    debitColumn: params.form.debitColumn || undefined,
    amountColumn: params.form.amountColumn || undefined,
    balanceColumn: params.form.balanceColumn || undefined,
  });

  const storagePath = `${params.form.month}/${Date.now()}-${params.fileName}`;
  await uploadPrivateFile({
    bucket: "statements",
    path: storagePath,
    contentType: "text/csv",
    body: params.fileBuffer,
  });

  const { start, end } = monthBounds(params.form.month);
  const { data: importRow, error: importError } = await db
    .from("bank_imports")
    .insert({
      company_id: profileRow.company_id,
      bank_account_id: bankAccount.id,
      source_filename: params.fileName,
      storage_path: storagePath,
      imported_by: profile.id,
      import_month: payrollMonthToDate(params.form.month),
      row_count: parsed.summary.rowCount,
      deduplicated_count: parsed.summary.duplicateCount,
      period_start: start,
      period_end: end,
    })
    .select("id")
    .single();

  if (importError || !importRow) return { ok: false, message: importError?.message ?? "Unable to create import batch." };

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
    if (transactionError) return { ok: false, message: transactionError.message };
  }

  const serviceRole = await createServiceRoleClient();
  if (serviceRole) {
    const admin = serviceRole as any;
    await admin.from("documents").insert({
      company_id: profileRow.company_id,
      document_kind: "statement",
      file_name: params.fileName,
      storage_path: storagePath,
      mime_type: "text/csv",
      size_bytes: params.fileBuffer.byteLength,
      linked_entity: "bank_import",
      linked_id: importRow.id,
      uploaded_by: profile.id,
    });
  }

  await insertAuditLog(profileRow.company_id, profile.id, "bank.import.created", "bank_import", importRow.id, `Imported ${params.fileName}`, {
    month: params.form.month,
    rowCount: parsed.summary.rowCount,
    importedCount: parsed.summary.importedCount,
  });
  revalidatePath("/bank");
  revalidatePath("/dashboard");
  return { ok: true, message: `${parsed.summary.importedCount} transactions imported.`, summary: parsed.summary };
}
