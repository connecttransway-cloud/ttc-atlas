import { differenceInCalendarDays, endOfMonth, parseISO, startOfMonth } from "date-fns";
import type { Employee, PayrollAdjustment, PayrollItem, SalaryStructure } from "@/lib/types/domain";
import { toAmount } from "@/lib/utils";

const PF_RATE = 0.12;
const PF_BASIC_CAP = 15000;
const PROFESSIONAL_TAX_DEFAULT = 200;

export interface PayrollRunInput {
  month: string;
  employees: Employee[];
  salaryStructures: SalaryStructure[];
  adjustments: PayrollAdjustment[];
  attendance?: Record<string, { paidDays: number; lopDays: number }>;
}

export interface PayrollComputation {
  items: Omit<PayrollItem, "id" | "payrollRunId" | "status" | "payslipDocumentId">[];
  totals: {
    totalEmployees: number;
    totalGross: number;
    totalNet: number;
    totalEmployerCost: number;
  };
}

export interface PayrollValidationIssue {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  reason: "missing_salary_structure";
}

export class PayrollValidationError extends Error {
  constructor(public readonly issues: PayrollValidationIssue[]) {
    super(`Payroll validation failed for ${issues.map((issue) => issue.employeeCode).join(", ")}`);
    this.name = "PayrollValidationError";
  }
}

function daysInPayrollMonth(month: string) {
  const start = startOfMonth(parseISO(`${month}-01`));
  const end = endOfMonth(start);
  return differenceInCalendarDays(end, start) + 1;
}

function getEffectiveStructure(employeeId: string, month: string, salaryStructures: SalaryStructure[]) {
  return salaryStructures
    .filter((structure) => structure.employeeId === employeeId && structure.effectiveDate <= `${month}-31`)
    .sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate))
    .at(-1);
}

function calculateApproximateTds(monthlyTaxablePay: number) {
  if (monthlyTaxablePay <= 50000) return 0;
  if (monthlyTaxablePay <= 100000) return toAmount(monthlyTaxablePay * 0.08);
  return toAmount(monthlyTaxablePay * 0.1);
}

function getActiveEmployeesForMonth(month: string, employees: Employee[]) {
  return employees.filter((employee) => employee.status === "active" && employee.joinDate <= `${month}-31` && (!employee.leaveDate || employee.leaveDate >= `${month}-01`));
}

export function getPayrollValidationIssues(input: Pick<PayrollRunInput, "month" | "employees" | "salaryStructures">): PayrollValidationIssue[] {
  return getActiveEmployeesForMonth(input.month, input.employees)
    .filter((employee) => !getEffectiveStructure(employee.id, input.month, input.salaryStructures))
    .map((employee) => ({
      employeeId: employee.id,
      employeeCode: employee.employeeCode,
      employeeName: employee.fullName,
      reason: "missing_salary_structure" as const,
    }));
}

export function buildPayrollRun(input: PayrollRunInput): PayrollComputation {
  const monthDays = daysInPayrollMonth(input.month);
  const issues = getPayrollValidationIssues(input);

  if (issues.length > 0) {
    throw new PayrollValidationError(issues);
  }

  const items = getActiveEmployeesForMonth(input.month, input.employees)
    .map((employee) => {
      const structure = getEffectiveStructure(employee.id, input.month, input.salaryStructures)!;

      const attendance = input.attendance?.[employee.id] ?? { paidDays: monthDays, lopDays: 0 };
      const prorationFactor = attendance.paidDays / monthDays;

      const baseEarnings = {
        basic: toAmount(structure.basic * prorationFactor),
        hra: toAmount(structure.hra * prorationFactor),
        specialAllowance: toAmount(structure.specialAllowance * prorationFactor),
        fixedAllowance: toAmount(structure.fixedAllowance * prorationFactor),
        otherFixedEarnings: toAmount(structure.otherFixedEarnings * prorationFactor),
      };

      const employeeAdjustments = input.adjustments.filter((adjustment) => adjustment.employeeId === employee.id && adjustment.month === input.month);
      const bonus = employeeAdjustments.filter((a) => a.kind === "bonus" || a.kind === "incentive").reduce((sum, item) => sum + item.amount, 0);
      const reimbursements = employeeAdjustments.filter((a) => a.kind === "reimbursement").reduce((sum, item) => sum + item.amount, 0);
      const advanceRecovery = employeeAdjustments.filter((a) => a.kind === "advance_recovery").reduce((sum, item) => sum + item.amount, 0);
      const manualDeductions = employeeAdjustments.filter((a) => a.kind === "manual_deduction").reduce((sum, item) => sum + item.amount, 0);

      const grossPay = toAmount(Object.values(baseEarnings).reduce((sum, item) => sum + item, 0) + bonus);
      const pfBase = Math.min(baseEarnings.basic, PF_BASIC_CAP);
      const employeePf = employee.pfEligible && structure.employeePfEnabled ? toAmount(pfBase * PF_RATE) : 0;
      const employerPf = employee.pfEligible && structure.employerPfEnabled ? toAmount(pfBase * PF_RATE) : 0;
      const professionalTax = structure.professionalTaxEnabled ? PROFESSIONAL_TAX_DEFAULT : 0;
      const taxable = grossPay - employeePf - professionalTax;
      const tds = structure.tdsEnabled ? calculateApproximateTds(taxable) : 0;
      const otherDeductions = toAmount(advanceRecovery + manualDeductions);
      const netPay = toAmount(grossPay + reimbursements - employeePf - professionalTax - tds - otherDeductions);

      return {
        employeeId: employee.id,
        month: input.month,
        paidDays: attendance.paidDays,
        lopDays: attendance.lopDays,
        grossPay,
        employeePf,
        employerPf,
        professionalTax,
        tds,
        otherDeductions,
        reimbursements,
        netPay,
        calcSnapshot: {
          structureId: structure.id,
          prorationFactor,
          earnings: { ...baseEarnings, bonus, reimbursements },
          deductions: { employeePf, employerPf, professionalTax, tds, advanceRecovery, manualDeductions },
          adjustments: employeeAdjustments,
        },
      };
    });

  return {
    items,
    totals: {
      totalEmployees: items.length,
      totalGross: toAmount(items.reduce((sum, item) => sum + item.grossPay, 0)),
      totalNet: toAmount(items.reduce((sum, item) => sum + item.netPay, 0)),
      totalEmployerCost: toAmount(items.reduce((sum, item) => sum + item.grossPay + item.employerPf, 0)),
    },
  };
}
