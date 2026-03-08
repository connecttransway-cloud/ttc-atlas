import { z } from "zod";

export const employeeSchema = z.object({
  employeeCode: z.string().min(3).max(20),
  fullName: z.string().min(2).max(120),
  email: z.email(),
  phone: z.string().min(10).max(20),
  designation: z.string().min(2).max(120),
  department: z.string().min(2).max(120),
  location: z.string().min(2).max(120),
  joinDate: z.string().min(10),
  leaveDate: z.string().optional().or(z.literal("")),
  pan: z.string().length(10),
  uan: z.string().optional().or(z.literal("")),
  pfEligible: z.boolean(),
  bankAccountName: z.string().min(2).max(120),
  bankAccountNumber: z.string().min(6).max(32),
  bankIfsc: z.string().min(5).max(20),
  status: z.enum(["active", "inactive"]),
});

export const vendorSchema = z.object({
  name: z.string().min(2).max(160),
  kind: z.enum(["vendor", "freelancer"]),
  email: z.email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  gstin: z.string().optional().or(z.literal("")),
  pan: z.string().optional().or(z.literal("")),
  defaultCategoryId: z.string().min(1),
  tdsApplicable: z.boolean(),
  active: z.boolean(),
});

export const invoiceLineItemSchema = z.object({
  description: z.string().min(2).max(200),
  quantity: z.coerce.number().positive(),
  rate: z.coerce.number().nonnegative(),
  taxPercent: z.coerce.number().min(0).max(100),
});

export const invoiceSchema = z.object({
  invoiceNumber: z.string().min(3).max(40),
  issueDate: z.string().min(10),
  dueDate: z.string().min(10),
  customerName: z.string().min(2).max(160),
  customerAddress: z.string().min(8).max(500),
  gstin: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  status: z.enum(["draft", "sent", "paid"]),
  lineItems: z.array(invoiceLineItemSchema).min(1),
});

export const salaryStructureSchema = z.object({
  effectiveDate: z.string().min(10),
  basic: z.coerce.number().nonnegative(),
  hra: z.coerce.number().nonnegative(),
  specialAllowance: z.coerce.number().nonnegative(),
  fixedAllowance: z.coerce.number().nonnegative(),
  otherFixedEarnings: z.coerce.number().nonnegative(),
  employeePfEnabled: z.boolean(),
  employerPfEnabled: z.boolean(),
  professionalTaxEnabled: z.boolean(),
  tdsEnabled: z.boolean(),
});

export const payrollAdjustmentSchema = z.object({
  employeeId: z.string().min(1),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  kind: z.enum(["bonus", "reimbursement", "advance_recovery", "manual_deduction", "incentive"]),
  label: z.string().min(2).max(100),
  amount: z.coerce.number().nonnegative(),
});

export const bankImportSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  hasHeader: z.boolean().default(true),
  delimiter: z.enum([",", ";", "\t"]).default(","),
  dateColumn: z.string().min(1),
  narrationColumn: z.string().min(1),
  referenceColumn: z.string().min(1),
  creditColumn: z.string().optional().or(z.literal("")),
  debitColumn: z.string().optional().or(z.literal("")),
  amountColumn: z.string().optional().or(z.literal("")),
  balanceColumn: z.string().optional().or(z.literal("")),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
export type VendorFormValues = z.infer<typeof vendorSchema>;
export type InvoiceFormInput = z.input<typeof invoiceSchema>;
export type InvoiceFormValues = z.output<typeof invoiceSchema>;
export type SalaryStructureFormValues = z.infer<typeof salaryStructureSchema>;
export type PayrollAdjustmentFormValues = z.infer<typeof payrollAdjustmentSchema>;
export type BankImportFormInput = z.input<typeof bankImportSchema>;
export type BankImportFormValues = z.output<typeof bankImportSchema>;
