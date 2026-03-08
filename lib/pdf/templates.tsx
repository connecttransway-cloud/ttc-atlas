import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Company, Employee, Invoice, PayrollItem } from "@/lib/types/domain";
import { formatCurrency, formatDate, formatMonth } from "@/lib/utils";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, color: "#101828", fontFamily: "Helvetica" },
  heading: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  muted: { color: "#475467" },
  section: { marginTop: 18, paddingTop: 12, borderTop: "1 solid #e4e7ec" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  tableHeader: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#f8fafc", padding: 8, borderRadius: 8, marginBottom: 6 },
  tableRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottom: "1 solid #eef2f6" },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
});

export function PayslipPdfDocument({
  company,
  employee,
  payrollItem,
}: {
  company: Company;
  employee: Employee;
  payrollItem: PayrollItem;
}) {
  const snapshot = payrollItem.calcSnapshot as {
    earnings: Record<string, number>;
    deductions: Record<string, number>;
  };

  return (
    <Document title={`Payslip ${employee.fullName} ${payrollItem.month}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.heading}>{company.legalName}</Text>
            <Text style={styles.muted}>{company.address}</Text>
            <Text style={styles.muted}>Payslip for {formatMonth(payrollItem.month)}</Text>
          </View>
          <View>
            <Text>{employee.fullName}</Text>
            <Text style={styles.muted}>{employee.designation}</Text>
            <Text style={styles.muted}>{employee.employeeCode}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text>Paid days</Text>
            <Text>{payrollItem.paidDays}</Text>
          </View>
          <View style={styles.row}>
            <Text>Bank account</Text>
            <Text>{employee.bankAccountNumberMasked}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.tableHeader}>
            <Text>Earnings</Text>
            <Text>Amount</Text>
          </View>
          {Object.entries(snapshot.earnings).map(([label, value]) => (
            <View key={label} style={styles.tableRow}>
              <Text>{label}</Text>
              <Text>{formatCurrency(Number(value))}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.tableHeader}>
            <Text>Deductions</Text>
            <Text>Amount</Text>
          </View>
          {Object.entries(snapshot.deductions).map(([label, value]) => (
            <View key={label} style={styles.tableRow}>
              <Text>{label}</Text>
              <Text>{formatCurrency(Number(value))}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text>Net pay</Text>
            <Text>{formatCurrency(payrollItem.netPay)}</Text>
          </View>
          <View style={styles.row}>
            <Text>Employer PF</Text>
            <Text>{formatCurrency(payrollItem.employerPf)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export function InvoicePdfDocument({ company, invoice }: { company: Company; invoice: Invoice }) {
  return (
    <Document title={`Invoice ${invoice.invoiceNumber}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.heading}>{company.tradeName}</Text>
            <Text style={styles.muted}>{company.address}</Text>
          </View>
          <View>
            <Text>Invoice</Text>
            <Text style={styles.muted}>{invoice.invoiceNumber}</Text>
            <Text style={styles.muted}>Issue: {formatDate(invoice.issueDate)}</Text>
            <Text style={styles.muted}>Due: {formatDate(invoice.dueDate)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text>{invoice.customerName}</Text>
          <Text style={styles.muted}>{invoice.customerAddress}</Text>
          {invoice.gstin ? <Text style={styles.muted}>GSTIN: {invoice.gstin}</Text> : null}
        </View>

        <View style={styles.section}>
          <View style={styles.tableHeader}>
            <Text>Description</Text>
            <Text>Amount</Text>
          </View>
          {invoice.lineItems.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text>
                {item.description} x {item.quantity}
              </Text>
              <Text>{formatCurrency(item.quantity * item.rate)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text>Subtotal</Text>
            <Text>{formatCurrency(invoice.subtotal)}</Text>
          </View>
          <View style={styles.row}>
            <Text>Tax</Text>
            <Text>{formatCurrency(invoice.taxTotal)}</Text>
          </View>
          <View style={styles.row}>
            <Text>Grand total</Text>
            <Text>{formatCurrency(invoice.grandTotal)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
