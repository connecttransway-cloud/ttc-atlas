import { Plus } from "lucide-react";
import { EmployeeForm } from "@/components/employees/employee-form";
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
