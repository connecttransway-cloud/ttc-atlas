import { ArrowRight, Download, FileSpreadsheet, Wallet } from "lucide-react";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDashboardData } from "@/lib/data/queries";
import { formatCurrency, formatDate, formatMonth } from "@/lib/utils";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const currentPayroll = data.payrollRuns[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Month-end workspace"
        title="Finish India month-end in one pass"
        description="The operator workflow stays focused: import the bank statement, clear review items, run payroll, export payslips, and send the CA package."
        badge={currentPayroll.status}
        actions={
          <>
            <Button variant="secondary">
              <Download className="h-4 w-4" />
              Bank payment sheet
            </Button>
            <Button asChild>
              <a href={`/api/exports/ca/${currentPayroll.month}`}>
                <FileSpreadsheet className="h-4 w-4" />
                Download CA export
              </a>
            </Button>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Main account balance" value={data.bankTransactions[0]?.balance ?? 0} delta="After latest reviewed transaction" />
        <MetricCard label="Payroll net" value={currentPayroll.totalNet} delta={`${currentPayroll.totalEmployees} employees for ${formatMonth(currentPayroll.month)}`} />
        <MetricCard label="Pending review" value={data.bankTransactions.filter((txn) => txn.status === "unreviewed").length} delta="Transactions still needing operator review" />
        <MetricCard label="Invoice receipts" value={data.invoices.reduce((sum, invoice) => sum + invoice.grandTotal, 0)} delta="Registered customer invoices" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Month-end workflow</CardTitle>
            <CardDescription>One calm checklist designed for a 15-30 minute finish.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {[
              ["1. Import statement", `${data.bankImports[0]?.rowCount ?? 0} rows imported and deduplicated.`],
              ["2. Review transactions", `${data.bankTransactions.filter((txn) => txn.status !== "matched").length} rows need review or categorization.`],
              ["3. Run payroll", `${currentPayroll.totalEmployees} employees in ${currentPayroll.status} state.`],
              ["4. Generate payslips", `${data.payrollItems.length} payslips ready for download.`],
              ["5. Review expenses", `${data.vendors.length} vendors and freelancers with linked payouts.`],
              ["6. Export CA pack", `ZIP package available for ${formatMonth(currentPayroll.month)}.`],
            ].map(([title, description]) => (
              <div key={title} className="rounded-[24px] border border-border bg-surface-subtle p-5">
                <p className="text-sm font-semibold text-ink">{title}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Funding and cash posture</CardTitle>
            <CardDescription>Single India operating account with clear view into funding, payroll, and operating outflow.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.bankTransactions.slice(0, 4).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between rounded-[22px] border border-border bg-surface-subtle p-4">
                <div>
                  <p className="text-sm font-semibold text-ink">{transaction.counterpartyName ?? transaction.narration}</p>
                  <p className="text-xs text-muted">{formatDate(transaction.postedAt)} • {transaction.type.replaceAll("_", " ")}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-ink">{transaction.direction === "credit" ? "+" : "-"}{formatCurrency(transaction.amount)}</p>
                  <Badge variant={transaction.direction === "credit" ? "success" : "default"}>{transaction.direction}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Payroll register snapshot</CardTitle>
            <CardDescription>Deterministic calculations preserved in item snapshots for audit and regeneration control.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Gross</TableHead>
                  <TableHead>PF</TableHead>
                  <TableHead>TDS</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.payrollItems.map((item) => {
                  const employee = data.employees.find((entry) => entry.id === item.employeeId);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{employee?.fullName}</p>
                          <p className="text-xs text-muted">{employee?.designation}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(item.grossPay)}</TableCell>
                      <TableCell>{formatCurrency(item.employeePf)}</TableCell>
                      <TableCell>{formatCurrency(item.tds)}</TableCell>
                      <TableCell>{formatCurrency(item.netPay)}</TableCell>
                      <TableCell><Badge variant="accent">{item.status}</Badge></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operator inbox</CardTitle>
            <CardDescription>The few decisions that still require attention.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: "2 bank transactions need category review", meta: "Open bank review", href: "/bank" },
              { title: "January payroll is ready for approval", meta: "Open payroll", href: "/payroll" },
              { title: "CA export package is ready to share", meta: "Open export center", href: "/exports" },
            ].map((item) => (
              <a key={item.title} href={item.href} className="flex items-center justify-between rounded-[22px] border border-border bg-surface-subtle p-4">
                <div>
                  <p className="text-sm font-semibold text-ink">{item.title}</p>
                  <p className="text-xs text-muted">{item.meta}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted" />
              </a>
            ))}
            <div className="rounded-[22px] border border-border bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-accent-soft p-2 text-accent">
                  <Wallet className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">Current payroll month</p>
                  <p className="text-xs text-muted">{formatMonth(currentPayroll.month)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
