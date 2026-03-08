import { renderToBuffer } from "@react-pdf/renderer";
import type { Company, Employee, Invoice, PayrollItem } from "@/lib/types/domain";
import { InvoicePdfDocument, PayslipPdfDocument } from "@/lib/pdf/templates";

export async function renderPayslipPdf(company: Company, employee: Employee, item: PayrollItem) {
  return renderToBuffer(<PayslipPdfDocument company={company} employee={employee} payrollItem={item} />);
}

export async function renderInvoicePdf(company: Company, invoice: Invoice) {
  return renderToBuffer(<InvoicePdfDocument company={company} invoice={invoice} />);
}
