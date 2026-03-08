import { CircleAlert, Plus } from "lucide-react";
import { EmployeeForm } from "@/components/employees/employee-form";
import { SalaryStructureForm } from "@/components/employees/salary-structure-form";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDashboardData } from "@/lib/data/queries";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function EmployeesPage() {
  const data = await getDashboardData();
  const employeesMissingStructure = data.employees.filter((employee) => !data.salaryStructures.some((entry) => entry.employeeId === employee.id));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Employee master"
        title="Employee records and salary structures"
        description="Keep payroll inputs clean: identity, tax details, PF eligibility, bank details, and effective-dated salary structure."
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                New employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create employee</DialogTitle>
                <DialogDescription>Validated with Zod + React Hook Form and ready to wire to a server action.</DialogDescription>
              </DialogHeader>
              <EmployeeForm />
            </DialogContent>
          </Dialog>
        }
      />

      {employeesMissingStructure.length > 0 ? (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="flex gap-3 p-6">
            <div className="rounded-2xl bg-warning/10 p-2 text-warning">
              <CircleAlert className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Payroll prerequisites are incomplete.</p>
              <p className="mt-1 text-sm text-muted">
                Add salary structures for {employeesMissingStructure.map((employee) => `${employee.fullName} (${employee.employeeCode})`).join(", ")} before running payroll.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-3">
        {data.employees.map((employee) => {
          const structure = data.salaryStructures.find((entry) => entry.employeeId === employee.id);
          return (
            <Card key={employee.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{employee.fullName}</CardTitle>
                    <CardDescription>{employee.designation} • {employee.department}</CardDescription>
                  </div>
                  <Badge variant={employee.status === "active" ? "success" : "default"}>{employee.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>{employee.email}</p>
                <p>{employee.location} • Joined {formatDate(employee.joinDate)}</p>
                <p>PF: {employee.pfEligible ? "Eligible" : "Not eligible"}</p>
                {structure ? <p>Monthly fixed pay: {formatCurrency(structure.basic + structure.hra + structure.specialAllowance + structure.fixedAllowance + structure.otherFixedEarnings)}</p> : null}
                {!structure ? <p className="font-medium text-warning">Salary structure missing</p> : null}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant={structure ? "secondary" : "default"} className="mt-2">
                      {structure ? "Edit salary structure" : "Add salary structure"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>{structure ? "Edit salary structure" : "Create salary structure"}</DialogTitle>
                      <DialogDescription>Effective-dated pay components used by the deterministic payroll engine.</DialogDescription>
                    </DialogHeader>
                    <SalaryStructureForm employee={employee} structure={structure} />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Salary structure matrix</CardTitle>
          <CardDescription>Effective-dated components used by the deterministic payroll engine.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Effective</TableHead>
                <TableHead>Basic</TableHead>
                <TableHead>HRA</TableHead>
                <TableHead>Special</TableHead>
                <TableHead>Flags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.salaryStructures.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-muted">
                    No salary structures yet. Add one from an employee card to enable payroll.
                  </TableCell>
                </TableRow>
              ) : null}
              {data.salaryStructures.map((structure) => {
                const employee = data.employees.find((entry) => entry.id === structure.employeeId);
                return (
                  <TableRow key={structure.id}>
                    <TableCell>{employee?.fullName}</TableCell>
                    <TableCell>{formatDate(structure.effectiveDate)}</TableCell>
                    <TableCell>{formatCurrency(structure.basic)}</TableCell>
                    <TableCell>{formatCurrency(structure.hra)}</TableCell>
                    <TableCell>{formatCurrency(structure.specialAllowance)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {structure.employeePfEnabled ? <Badge variant="accent">Emp PF</Badge> : null}
                        {structure.employerPfEnabled ? <Badge variant="accent">Er PF</Badge> : null}
                        {structure.tdsEnabled ? <Badge variant="warning">TDS</Badge> : null}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
