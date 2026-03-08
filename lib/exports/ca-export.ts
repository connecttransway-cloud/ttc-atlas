import JSZip from "jszip";
import type { DashboardData } from "@/lib/types/domain";
import { downloadName, formatCurrency, formatMonth } from "@/lib/utils";
import { renderPayslipPdf, renderInvoicePdf } from "@/lib/pdf/render";
import { downloadPrivateFile } from "@/lib/storage/files";

function csvEscape(value: string | number | boolean | null | undefined) {
  const text = value === undefined || value === null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function toCsv(headers: string[], rows: (string | number | boolean | null | undefined)[][]) {
  return [headers.map(csvEscape).join(","), ...rows.map((row) => row.map(csvEscape).join(","))].join("\n");
}

export async function buildCaExportZip(data: DashboardData, month: string) {
  const zip = new JSZip();
  const monthFolder = zip.folder(month);

  if (!monthFolder) {
    throw new Error("Unable to create export folder");
  }

  const transactions = data.bankTransactions.filter((txn) => txn.postedAt.startsWith(month));
  monthFolder.file(
    "bank-transactions.csv",
    toCsv(
      ["Date", "Narration", "Ref", "Direction", "Amount", "Type", "Category", "GST", "TDS"],
      transactions.map((txn) => [txn.postedAt, txn.narration, txn.referenceNumber, txn.direction, txn.amount, txn.type, txn.categoryId, txn.gstFlag, txn.tdsFlag]),
    ),
  );

  monthFolder.file(
    "payroll-register.csv",
    toCsv(
      ["Employee", "Month", "Gross", "Employee PF", "Employer PF", "PT", "TDS", "Net"],
      data.payrollItems
        .filter((item) => item.month === month)
        .map((item) => {
          const employee = data.employees.find((entry) => entry.id === item.employeeId);
          return [employee?.fullName ?? item.employeeId, item.month, item.grossPay, item.employeePf, item.employerPf, item.professionalTax, item.tds, item.netPay];
        }),
    ),
  );

  monthFolder.file(
    "employees.csv",
    toCsv(
      ["Code", "Name", "Email", "Department", "PF Eligible", "Status"],
      data.employees.map((employee) => [employee.employeeCode, employee.fullName, employee.email, employee.department, employee.pfEligible, employee.status]),
    ),
  );

  monthFolder.file(
    "vendors.csv",
    toCsv(
      ["Name", "Kind", "Email", "GSTIN", "TDS Applicable"],
      data.vendors.map((vendor) => [vendor.name, vendor.kind, vendor.email ?? "", vendor.gstin ?? "", vendor.tdsApplicable]),
    ),
  );

  monthFolder.file(
    "invoice-register.csv",
    toCsv(
      ["Invoice", "Customer", "Issue Date", "Due Date", "Status", "Grand Total"],
      data.invoices.map((invoice) => [invoice.invoiceNumber, invoice.customerName, invoice.issueDate, invoice.dueDate, invoice.status, invoice.grandTotal]),
    ),
  );

  monthFolder.file(
    "monthly-summary.csv",
    toCsv(
      ["Metric", "Value"],
      [
        ["Month", formatMonth(month)],
        ["Transactions", transactions.length],
        ["Payroll net", formatCurrency(data.payrollItems.filter((item) => item.month === month).reduce((sum, item) => sum + item.netPay, 0))],
        ["Invoices", data.invoices.length],
      ],
    ),
  );

  const payslipFolder = monthFolder.folder("payslips");
  if (payslipFolder) {
    for (const item of data.payrollItems.filter((entry) => entry.month === month)) {
      const employee = data.employees.find((entry) => entry.id === item.employeeId);
      if (!employee) continue;
      const pdf = await renderPayslipPdf(data.company, employee, item);
      payslipFolder.file(downloadName(`payslip-${employee.employeeCode}`, month, "pdf"), pdf);
    }
  }

  const invoiceFolder = monthFolder.folder("invoices");
  if (invoiceFolder) {
    for (const invoice of data.invoices) {
      const pdf = await renderInvoicePdf(data.company, invoice);
      invoiceFolder.file(`${invoice.invoiceNumber}.pdf`, pdf);
    }
  }

  const supportFolder = monthFolder.folder("supporting-documents");
  if (supportFolder) {
    for (const document of data.documents.filter((entry) => !["payslip", "invoice"].includes(entry.kind))) {
      const bucket =
        document.kind === "statement" ? "statements" : document.kind === "other" || document.kind === "expense_proof" ? "documents" : "documents";
      const content = await downloadPrivateFile(bucket, document.storagePath);
      if (content) {
        supportFolder.file(document.name, content);
      }
    }
  }

  return zip.generateAsync({ type: "uint8array" });
}
