/* eslint-disable @typescript-eslint/no-explicit-any */
import { cache } from "react";
import { endOfMonth, startOfMonth } from "date-fns";
import { demoData } from "@/lib/data/demo-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import type { Database } from "@/lib/types/database";
import type { AuditLog, BankImportBatch, BankTransaction, Category, Company, DashboardData, DocumentRecord, Employee, Invoice, InvoiceLineItem, PayrollAdjustment, PayrollItem, PayrollRun, Profile, SalaryStructure, SavedRule, Vendor } from "@/lib/types/domain";

type Tables = Database["public"]["Tables"];

function asCompany(row: Tables["companies"]["Row"]): Company {
  return {
    id: row.id,
    legalName: row.legal_name,
    tradeName: row.trade_name,
    gstin: row.gstin,
    pan: row.pan,
    pfRegistrationNumber: row.pf_registration_number,
    address: row.address,
  };
}

function asProfile(row: Tables["profiles"]["Row"]): Profile {
  return { id: row.id, fullName: row.full_name, email: row.email, role: row.role };
}

function asCategory(row: Tables["categories"]["Row"]): Category {
  return { id: row.id, name: row.name, code: row.code, type: row.type, description: row.description ?? undefined };
}

function asDocument(row: Tables["documents"]["Row"]): DocumentRecord {
  return {
    id: row.id,
    name: row.file_name,
    kind: row.document_kind,
    storagePath: row.storage_path,
    linkedEntity: row.linked_entity,
    linkedId: row.linked_id,
  };
}

function asImport(row: Tables["bank_imports"]["Row"]): BankImportBatch {
  return {
    id: row.id,
    accountId: row.bank_account_id,
    sourceFilename: row.source_filename,
    importedAt: row.created_at,
    rowCount: row.row_count,
    deduplicatedCount: row.deduplicated_count,
    periodStart: row.period_start,
    periodEnd: row.period_end,
  };
}

function asTransaction(row: Tables["bank_transactions"]["Row"]): BankTransaction {
  return {
    id: row.id,
    accountId: row.bank_account_id,
    importId: row.bank_import_id,
    postedAt: row.posted_at,
    narration: row.narration,
    normalizedNarration: row.normalized_narration,
    referenceNumber: row.reference_number,
    direction: row.direction,
    amount: Number(row.amount),
    balance: Number(row.balance),
    counterpartyName: row.counterparty_name,
    type: row.transaction_type,
    categoryId: row.category_id ?? "",
    gstFlag: row.gst_flag,
    tdsFlag: row.tds_flag,
    status: row.review_status,
    notes: row.notes ?? undefined,
    internalMemo: row.internal_memo ?? undefined,
    employeeId: row.employee_id,
    vendorId: row.vendor_id,
    invoiceId: row.invoice_id,
    tags: [],
  };
}

function asEmployee(row: Tables["employees"]["Row"]): Employee {
  return {
    id: row.id,
    employeeCode: row.employee_code,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone ?? "",
    designation: row.designation,
    department: row.department,
    location: row.location,
    joinDate: row.join_date,
    leaveDate: row.leave_date,
    pan: row.pan,
    uan: row.uan,
    pfEligible: row.pf_eligible,
    bankAccountName: row.bank_account_name,
    bankAccountNumberMasked: row.bank_account_number_masked,
    bankIfsc: row.bank_ifsc,
    status: row.status,
  };
}

function asSalaryStructure(row: Tables["salary_structures"]["Row"]): SalaryStructure {
  return {
    id: row.id,
    employeeId: row.employee_id,
    effectiveDate: row.effective_date,
    basic: Number(row.monthly_basic),
    hra: Number(row.hra),
    specialAllowance: Number(row.special_allowance),
    fixedAllowance: Number(row.fixed_allowance),
    otherFixedEarnings: Number(row.other_fixed_earnings),
    employeePfEnabled: row.employee_pf_enabled,
    employerPfEnabled: row.employer_pf_enabled,
    professionalTaxEnabled: row.professional_tax_enabled,
    tdsEnabled: row.tds_enabled,
  };
}

function asPayrollRun(row: Tables["payroll_runs"]["Row"]): PayrollRun {
  return {
    id: row.id,
    month: row.payroll_month.slice(0, 7),
    status: row.status,
    totalEmployees: row.total_employees,
    totalGross: Number(row.total_gross),
    totalNet: Number(row.total_net),
    totalEmployerCost: Number(row.total_employer_cost),
    lockedAt: row.locked_at,
    approvedAt: row.approved_at,
  };
}

function asPayrollItem(row: Tables["payroll_items"]["Row"]): PayrollItem {
  return {
    id: row.id,
    payrollRunId: row.payroll_run_id,
    employeeId: row.employee_id,
    month: row.payroll_month.slice(0, 7),
    paidDays: Number(row.paid_days),
    lopDays: Number(row.lop_days),
    grossPay: Number(row.gross_pay),
    employeePf: Number(row.employee_pf),
    employerPf: Number(row.employer_pf),
    professionalTax: Number(row.professional_tax),
    tds: Number(row.tds),
    otherDeductions: Number(row.other_deductions),
    reimbursements: Number(row.reimbursements),
    netPay: Number(row.net_pay),
    status: "draft",
    calcSnapshot: (row.calc_snapshot ?? {}) as Record<string, unknown>,
    payslipDocumentId: row.payslip_document_id,
  };
}

function asPayrollAdjustment(row: Tables["payroll_adjustments"]["Row"]): PayrollAdjustment {
  return {
    id: row.id,
    employeeId: row.employee_id,
    month: row.payroll_month.slice(0, 7),
    kind: row.kind,
    amount: Number(row.amount),
    label: row.label,
  };
}

function asVendor(row: Tables["vendors"]["Row"]): Vendor {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    gstin: row.gstin,
    pan: row.pan,
    defaultCategoryId: row.default_category_id ?? "",
    tdsApplicable: row.tds_applicable,
    active: row.active,
  };
}

function asInvoice(row: Tables["invoices"]["Row"], lineItems: InvoiceLineItem[]): Invoice {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    issueDate: row.issue_date,
    dueDate: row.due_date,
    customerName: row.customer_name,
    customerAddress: row.customer_address,
    gstin: row.gstin,
    lineItems,
    notes: row.notes ?? undefined,
    subtotal: Number(row.subtotal),
    taxTotal: Number(row.tax_total),
    grandTotal: Number(row.grand_total),
    status: row.status,
  };
}

function asInvoiceLineItem(row: Tables["invoice_line_items"]["Row"]): InvoiceLineItem {
  return {
    id: row.id,
    description: row.description,
    quantity: Number(row.quantity),
    rate: Number(row.rate),
    taxPercent: Number(row.tax_percent),
  };
}

function asRule(row: Tables["saved_rules"]["Row"]): SavedRule {
  return {
    id: row.id,
    name: row.name,
    narrationPattern: row.narration_pattern,
    transactionType: row.transaction_type,
    categoryId: row.category_id ?? "",
    gstFlag: row.gst_flag,
    tdsFlag: row.tds_flag,
    linkedEmployeeId: row.linked_employee_id,
    linkedVendorId: row.linked_vendor_id,
  };
}

function asAuditLog(row: Tables["audit_logs"]["Row"], actorName: string): AuditLog {
  return {
    id: row.id,
    action: row.action,
    actorName,
    entityType: row.entity_type,
    entityId: row.entity_id,
    createdAt: row.created_at,
    diffSummary: row.diff_summary ?? "",
  };
}

export const getDashboardData = cache(async (): Promise<DashboardData> => {
  if (!hasSupabaseEnv()) return demoData;

  const supabase = await createServerSupabaseClient();
  if (!supabase) return demoData;
  const db = supabase as any;

  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return demoData;

  const { data: profileRow } = await db.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profileRow) return demoData;

  const companyId = profileRow.company_id;

  const [
    companyResult,
    accountsResult,
    categoriesResult,
    documentsResult,
    importsResult,
    transactionsResult,
    employeesResult,
    salaryStructuresResult,
    payrollRunsResult,
    payrollItemsResult,
    payrollAdjustmentsResult,
    vendorsResult,
    invoicesResult,
    invoiceLineItemsResult,
    rulesResult,
    auditLogsResult,
    auditProfilesResult,
  ] = await Promise.all([
    db.from("companies").select("*").eq("id", companyId).single(),
    db.from("bank_accounts").select("*").eq("company_id", companyId).order("is_primary", { ascending: false }),
    db.from("categories").select("*").eq("company_id", companyId).order("name"),
    db.from("documents").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
    db.from("bank_imports").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
    db.from("bank_transactions").select("*").eq("company_id", companyId).order("posted_at", { ascending: false }),
    db.from("employees").select("*").eq("company_id", companyId).is("deleted_at", null).order("full_name"),
    db.from("salary_structures").select("*").eq("company_id", companyId).order("effective_date", { ascending: false }),
    db.from("payroll_runs").select("*").eq("company_id", companyId).order("payroll_month", { ascending: false }),
    db.from("payroll_items").select("*").eq("company_id", companyId).order("payroll_month", { ascending: false }),
    db.from("payroll_adjustments").select("*").eq("company_id", companyId).order("payroll_month", { ascending: false }),
    db.from("vendors").select("*").eq("company_id", companyId).is("deleted_at", null).order("name"),
    db.from("invoices").select("*").eq("company_id", companyId).order("issue_date", { ascending: false }),
    db.from("invoice_line_items").select("*").order("sort_order"),
    db.from("saved_rules").select("*").eq("company_id", companyId).eq("active", true).order("priority"),
    db.from("audit_logs").select("*").eq("company_id", companyId).order("created_at", { ascending: false }).limit(50),
    db.from("profiles").select("id, full_name").eq("company_id", companyId),
  ]);

  const invoiceLineItemsByInvoice = new Map<string, InvoiceLineItem[]>();
  for (const row of (invoiceLineItemsResult.data ?? []) as Tables["invoice_line_items"]["Row"][]) {
    const current = invoiceLineItemsByInvoice.get(row.invoice_id) ?? [];
    current.push(asInvoiceLineItem(row));
    invoiceLineItemsByInvoice.set(row.invoice_id, current);
  }

  const auditActorNames = new Map<string, string>(
    ((auditProfilesResult.data ?? []) as Array<{ id: string; full_name: string }>).map((row) => [row.id, row.full_name]),
  );
  const primaryBankAccount = accountsResult.data?.[0];

  return {
    company: companyResult.data ? asCompany(companyResult.data) : demoData.company,
    bankAccount: primaryBankAccount
      ? {
          id: primaryBankAccount.id,
          bankName: primaryBankAccount.bank_name,
          accountName: primaryBankAccount.account_name,
          accountNumberMasked: primaryBankAccount.account_number_masked,
          ifsc: primaryBankAccount.ifsc,
          currency: primaryBankAccount.currency_code,
        }
      : demoData.bankAccount,
    profile: asProfile(profileRow),
    categories: (categoriesResult.data ?? []).map(asCategory),
    documents: (documentsResult.data ?? []).map(asDocument),
    bankImports: (importsResult.data ?? []).map(asImport),
    bankTransactions: (transactionsResult.data ?? []).map(asTransaction),
    employees: (employeesResult.data ?? []).map(asEmployee),
    salaryStructures: (salaryStructuresResult.data ?? []).map(asSalaryStructure),
    payrollRuns: (payrollRunsResult.data ?? []).map(asPayrollRun),
    payrollItems: (payrollItemsResult.data ?? []).map(asPayrollItem),
    payrollAdjustments: (payrollAdjustmentsResult.data ?? []).map(asPayrollAdjustment),
    vendors: (vendorsResult.data ?? []).map(asVendor),
    invoices: ((invoicesResult.data ?? []) as Tables["invoices"]["Row"][]).map((row) => asInvoice(row, invoiceLineItemsByInvoice.get(row.id) ?? [])),
    savedRules: (rulesResult.data ?? []).map(asRule),
    auditLogs: ((auditLogsResult.data ?? []) as Tables["audit_logs"]["Row"][]).map((row) => asAuditLog(row, auditActorNames.get(String(row.actor_profile_id ?? "")) ?? "System")),
  };
});

export const getMonthData = cache(async (month: string) => {
  const data = await getDashboardData();

  return {
    ...data,
    payrollRun: data.payrollRuns.find((run) => run.month === month) ?? data.payrollRuns[0],
    payrollItems: data.payrollItems.filter((item) => item.month === month),
    transactions: data.bankTransactions.filter((txn) => txn.postedAt.startsWith(month)),
    imports: data.bankImports.filter((batch) => batch.periodStart.startsWith(month) || batch.periodEnd.startsWith(month)),
    adjustments: data.payrollAdjustments.filter((entry) => entry.month === month),
  };
});

export function calculateInvoiceTotals(lineItems: Array<{ quantity: number; rate: number; taxPercent: number }>) {
  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const taxTotal = lineItems.reduce((sum, item) => sum + item.quantity * item.rate * (item.taxPercent / 100), 0);
  const grandTotal = subtotal + taxTotal;

  return { subtotal, taxTotal, grandTotal };
}

export function payrollMonthToDate(month: string) {
  return `${month}-01`;
}

export function monthBounds(month: string) {
  const start = startOfMonth(new Date(`${month}-01T00:00:00Z`)).toISOString().slice(0, 10);
  const end = endOfMonth(new Date(`${month}-01T00:00:00Z`)).toISOString().slice(0, 10);
  return { start, end };
}
