export type AppRole = "admin" | "finance_operator" | "payroll_operator" | "ca_readonly";
export type EmployeeStatus = "active" | "inactive";
export type PayrollStatus = "draft" | "reviewed" | "approved" | "locked";
export type InvoiceStatus = "draft" | "sent" | "paid";
export type TransactionDirection = "credit" | "debit";
export type TransactionType =
  | "intercompany_funding"
  | "salary"
  | "freelancer_payment"
  | "office_expense"
  | "reimbursement"
  | "bank_charge"
  | "invoice_receipt"
  | "other";

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  role: AppRole;
}

export interface Company {
  id: string;
  legalName: string;
  tradeName: string;
  gstin?: string | null;
  pan?: string | null;
  pfRegistrationNumber?: string | null;
  address: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumberMasked: string;
  ifsc: string;
  currency: string;
}

export interface Category {
  id: string;
  name: string;
  code: string;
  type: "income" | "expense" | "payroll" | "transfer";
  description?: string;
}

export interface DocumentRecord {
  id: string;
  name: string;
  kind: "statement" | "invoice" | "expense_proof" | "payslip" | "other";
  storagePath: string;
  linkedEntity: string;
  linkedId: string;
}

export interface BankImportBatch {
  id: string;
  accountId: string;
  sourceFilename: string;
  importedAt: string;
  rowCount: number;
  deduplicatedCount: number;
  periodStart: string;
  periodEnd: string;
}

export interface BankTransaction {
  id: string;
  accountId: string;
  importId: string;
  postedAt: string;
  narration: string;
  normalizedNarration: string;
  referenceNumber: string;
  direction: TransactionDirection;
  amount: number;
  balance: number;
  counterpartyName?: string | null;
  type: TransactionType;
  categoryId: string;
  gstFlag: boolean;
  tdsFlag: boolean;
  status: "unreviewed" | "reviewed" | "matched";
  notes?: string;
  internalMemo?: string;
  employeeId?: string | null;
  vendorId?: string | null;
  invoiceId?: string | null;
  tags: string[];
}

export interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  location: string;
  joinDate: string;
  leaveDate?: string | null;
  pan: string;
  uan?: string | null;
  pfEligible: boolean;
  bankAccountName: string;
  bankAccountNumberMasked: string;
  bankIfsc: string;
  status: EmployeeStatus;
}

export interface SalaryStructure {
  id: string;
  employeeId: string;
  effectiveDate: string;
  basic: number;
  hra: number;
  specialAllowance: number;
  fixedAllowance: number;
  otherFixedEarnings: number;
  employeePfEnabled: boolean;
  employerPfEnabled: boolean;
  professionalTaxEnabled: boolean;
  tdsEnabled: boolean;
}

export interface PayrollAdjustment {
  id: string;
  employeeId: string;
  month: string;
  kind: "bonus" | "reimbursement" | "advance_recovery" | "manual_deduction" | "incentive";
  amount: number;
  label: string;
}

export interface PayrollItem {
  id: string;
  payrollRunId: string;
  employeeId: string;
  month: string;
  paidDays: number;
  lopDays: number;
  grossPay: number;
  employeePf: number;
  employerPf: number;
  professionalTax: number;
  tds: number;
  otherDeductions: number;
  reimbursements: number;
  netPay: number;
  status: PayrollStatus;
  calcSnapshot: Record<string, unknown>;
  payslipDocumentId?: string | null;
}

export interface PayrollRun {
  id: string;
  month: string;
  status: PayrollStatus;
  totalEmployees: number;
  totalGross: number;
  totalNet: number;
  totalEmployerCost: number;
  lockedAt?: string | null;
  approvedAt?: string | null;
}

export interface Vendor {
  id: string;
  name: string;
  kind: "vendor" | "freelancer";
  email?: string;
  phone?: string;
  gstin?: string | null;
  pan?: string | null;
  defaultCategoryId: string;
  tdsApplicable: boolean;
  active: boolean;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  taxPercent: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  customerName: string;
  customerAddress: string;
  gstin?: string | null;
  lineItems: InvoiceLineItem[];
  notes?: string;
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  status: InvoiceStatus;
}

export interface SavedRule {
  id: string;
  name: string;
  narrationPattern: string;
  transactionType: TransactionType;
  categoryId: string;
  gstFlag: boolean;
  tdsFlag: boolean;
  linkedEmployeeId?: string | null;
  linkedVendorId?: string | null;
}

export interface AuditLog {
  id: string;
  action: string;
  actorName: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  diffSummary: string;
}

export interface DashboardData {
  company: Company;
  bankAccount: BankAccount;
  profile: Profile;
  categories: Category[];
  documents: DocumentRecord[];
  bankImports: BankImportBatch[];
  bankTransactions: BankTransaction[];
  employees: Employee[];
  salaryStructures: SalaryStructure[];
  payrollRuns: PayrollRun[];
  payrollItems: PayrollItem[];
  payrollAdjustments: PayrollAdjustment[];
  vendors: Vendor[];
  invoices: Invoice[];
  savedRules: SavedRule[];
  auditLogs: AuditLog[];
}
