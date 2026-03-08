"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveEmployeeAction } from "@/app/actions";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { employeeSchema, type EmployeeFormValues } from "@/lib/validation/schemas";
import type { Employee } from "@/lib/types/domain";

export function EmployeeForm({ employee }: { employee?: Employee }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employeeCode: employee?.employeeCode ?? "",
      fullName: employee?.fullName ?? "",
      email: employee?.email ?? "",
      phone: employee?.phone ?? "",
      designation: employee?.designation ?? "",
      department: employee?.department ?? "",
      location: employee?.location ?? "",
      joinDate: employee?.joinDate ?? "",
      leaveDate: employee?.leaveDate ?? "",
      pan: employee?.pan ?? "",
      uan: employee?.uan ?? "",
      pfEligible: employee?.pfEligible ?? true,
      bankAccountName: employee?.bankAccountName ?? "",
      bankAccountNumber: employee?.bankAccountNumberMasked ?? "",
      bankIfsc: employee?.bankIfsc ?? "",
      status: employee?.status ?? "active",
    },
  });
  const pfEligible = useWatch({ control: form.control, name: "pfEligible" });

  const onSubmit = form.handleSubmit((values) => {
    setIsPending(true);
    startTransition(async () => {
      const result = await saveEmployeeAction({ ...values, id: employee?.id });
      setIsPending(false);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
      if (!employee) {
        form.reset();
      }
    });
  });

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
      <Field label="Employee code"><Input {...form.register("employeeCode")} /></Field>
      <Field label="Full name"><Input {...form.register("fullName")} /></Field>
      <Field label="Email"><Input {...form.register("email")} /></Field>
      <Field label="Phone"><Input {...form.register("phone")} /></Field>
      <Field label="Designation"><Input {...form.register("designation")} /></Field>
      <Field label="Department"><Input {...form.register("department")} /></Field>
      <Field label="Location"><Input {...form.register("location")} /></Field>
      <Field label="Join date"><Input type="date" {...form.register("joinDate")} /></Field>
      <Field label="Leave date"><Input type="date" {...form.register("leaveDate")} /></Field>
      <Field label="PAN"><Input {...form.register("pan")} /></Field>
      <Field label="UAN"><Input {...form.register("uan")} /></Field>
      <Field label="Bank account name"><Input {...form.register("bankAccountName")} /></Field>
      <Field label="Bank account number"><Input {...form.register("bankAccountNumber")} /></Field>
      <Field label="Bank IFSC"><Input {...form.register("bankIfsc")} /></Field>
      <Field label="Status">
        <Select defaultValue={form.getValues("status")} onValueChange={(value) => form.setValue("status", value as EmployeeFormValues["status"])}>
          <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <div className="rounded-[24px] border border-border bg-surface-subtle p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink">PF eligible</p>
            <p className="text-xs text-muted">Enable employee and employer PF formulas.</p>
          </div>
          <Switch checked={pfEligible} onCheckedChange={(checked) => form.setValue("pfEligible", checked)} />
        </div>
      </div>
      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : employee ? "Save employee" : "Create employee"}</Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
