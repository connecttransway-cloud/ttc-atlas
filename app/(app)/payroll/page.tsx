import { PayrollActions } from "@/components/payroll/payroll-actions";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDashboardData } from "@/lib/data/queries";
import { buildPayrollRun } from "@/lib/payroll/engine";
import { formatCurrency, formatMonth } from "@/lib/utils";

export default async function PayrollPage() {
  const data = await getDashboardData();
  const run = data.payrollRuns[0];
  const recalculated = buildPayrollRun({
    month: run.month,
    employees: data.employees,
    salaryStructures: data.salaryStructures,
    adjustments: data.payrollAdjustments,
    attendance: Object.fromEntries(data.payrollItems.map((item) => [item.employeeId, { paidDays: item.paidDays, lopDays: item.lopDays }])),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Payroll engine"
        title={`Monthly payroll for ${formatMonth(run.month)}`}
        description="Deterministic formulas only. PF, PT, TDS, proration, reimbursements, and recoveries are all snapshot-preserved per employee item."
        badge={run.status}
        actions={<PayrollActions month={run.month} canLock={run.status !== "locked"} />}
      />

      <section className="grid gap-4 lg:grid-cols-4">
        {[
          ["Employees", recalculated.totals.totalEmployees],
          ["Gross pay", formatCurrency(recalculated.totals.totalGross)],
          ["Net pay", formatCurrency(recalculated.totals.totalNet)],
          ["Employer cost", formatCurrency(recalculated.totals.totalEmployerCost)],
        ].map(([title, value]) => (
          <Card key={title as string}>
            <CardHeader className="pb-2">
              <CardDescription>{title as string}</CardDescription>
              <CardTitle className="text-3xl">{String(value)}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Payroll register</CardTitle>
            <CardDescription>Each row stores its own calculation snapshot for audit and payslip generation.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Paid days</TableHead>
                  <TableHead>Gross</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Payslip</TableHead>
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
                          <p className="text-xs text-muted">{employee?.employeeCode}</p>
                        </div>
                      </TableCell>
                      <TableCell>{item.paidDays}</TableCell>
                      <TableCell>{formatCurrency(item.grossPay)}</TableCell>
                      <TableCell>{formatCurrency(item.employeePf + item.professionalTax + item.tds + item.otherDeductions)}</TableCell>
                      <TableCell>{formatCurrency(item.netPay)}</TableCell>
                      <TableCell>
                        <Button asChild size="sm" variant="secondary">
                          <a href={`/api/payroll/payslip/${item.id}`}>PDF</a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employer contribution summary</CardTitle>
              <CardDescription>Separate from take-home to keep CA and banking outputs clean.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.payrollItems.map((item) => {
                const employee = data.employees.find((entry) => entry.id === item.employeeId);
                return (
                  <div key={item.id} className="flex items-center justify-between rounded-[22px] border border-border bg-surface-subtle p-4">
                    <div>
                      <p className="text-sm font-medium text-ink">{employee?.fullName}</p>
                      <p className="text-xs text-muted">Employer PF</p>
                    </div>
                    <span className="font-medium text-ink">{formatCurrency(item.employerPf)}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Adjustments</CardTitle>
              <CardDescription>Manual entries are explicit and auditable.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.payrollAdjustments.map((adjustment) => {
                const employee = data.employees.find((entry) => entry.id === adjustment.employeeId);
                return (
                  <div key={adjustment.id} className="rounded-[22px] border border-border bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-ink">{adjustment.label}</p>
                        <p className="text-xs text-muted">{employee?.fullName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-ink">{formatCurrency(adjustment.amount)}</p>
                        <Badge variant="default">{adjustment.kind.replaceAll("_", " ")}</Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
