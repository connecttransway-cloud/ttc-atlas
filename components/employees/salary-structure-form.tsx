"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveSalaryStructureAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import type { Employee, SalaryStructure } from "@/lib/types/domain";
import { formatCurrency } from "@/lib/utils";
import { salaryStructureSchema, type SalaryStructureFormInput, type SalaryStructureFormValues } from "@/lib/validation/schemas";

export function SalaryStructureForm({ employee, structure }: { employee: Employee; structure?: SalaryStructure }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const form = useForm<SalaryStructureFormInput, unknown, SalaryStructureFormValues>({
    resolver: zodResolver(salaryStructureSchema),
    defaultValues: {
      effectiveDate: structure?.effectiveDate ?? new Date().toISOString().slice(0, 10),
      basic: structure?.basic ?? 0,
      hra: structure?.hra ?? 0,
      specialAllowance: structure?.specialAllowance ?? 0,
      fixedAllowance: structure?.fixedAllowance ?? 0,
      otherFixedEarnings: structure?.otherFixedEarnings ?? 0,
      employeePfEnabled: structure?.employeePfEnabled ?? employee.pfEligible,
      employerPfEnabled: structure?.employerPfEnabled ?? employee.pfEligible,
      professionalTaxEnabled: structure?.professionalTaxEnabled ?? true,
      tdsEnabled: structure?.tdsEnabled ?? true,
    },
  });

  const watched = useWatch({ control: form.control }) as Partial<SalaryStructureFormInput>;
  const monthlyFixedPay =
    Number(watched.basic ?? 0) +
    Number(watched.hra ?? 0) +
    Number(watched.specialAllowance ?? 0) +
    Number(watched.fixedAllowance ?? 0) +
    Number(watched.otherFixedEarnings ?? 0);

  const onSubmit = form.handleSubmit((values) => {
    setIsPending(true);
    startTransition(async () => {
      const result = await saveSalaryStructureAction(employee.id, { ...values, id: structure?.id });
      setIsPending(false);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  });

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
      <div className="md:col-span-2 rounded-[24px] border border-border bg-surface-subtle p-4">
        <p className="text-sm font-medium text-ink">{employee.fullName}</p>
        <p className="mt-1 text-xs text-muted">Monthly fixed pay: {formatCurrency(monthlyFixedPay)}</p>
      </div>

      <Field label="Effective date">
        <Input type="date" {...form.register("effectiveDate")} />
      </Field>
      <Field label="Monthly basic">
        <Input type="number" min="0" step="0.01" {...form.register("basic", { valueAsNumber: true })} />
      </Field>
      <Field label="HRA">
        <Input type="number" min="0" step="0.01" {...form.register("hra", { valueAsNumber: true })} />
      </Field>
      <Field label="Special allowance">
        <Input type="number" min="0" step="0.01" {...form.register("specialAllowance", { valueAsNumber: true })} />
      </Field>
      <Field label="Fixed allowance">
        <Input type="number" min="0" step="0.01" {...form.register("fixedAllowance", { valueAsNumber: true })} />
      </Field>
      <Field label="Other fixed earnings">
        <Input type="number" min="0" step="0.01" {...form.register("otherFixedEarnings", { valueAsNumber: true })} />
      </Field>

      <ToggleField
        label="Employee PF"
        description="Deduct employee PF when PF applies."
        checked={useWatch({ control: form.control, name: "employeePfEnabled" }) ?? false}
        onCheckedChange={(checked) => form.setValue("employeePfEnabled", checked)}
      />
      <ToggleField
        label="Employer PF"
        description="Track employer PF contribution separately."
        checked={useWatch({ control: form.control, name: "employerPfEnabled" }) ?? false}
        onCheckedChange={(checked) => form.setValue("employerPfEnabled", checked)}
      />
      <ToggleField
        label="Professional tax"
        description="Apply PT in payroll calculation."
        checked={useWatch({ control: form.control, name: "professionalTaxEnabled" }) ?? false}
        onCheckedChange={(checked) => form.setValue("professionalTaxEnabled", checked)}
      />
      <ToggleField
        label="TDS"
        description="Apply TDS estimation in payroll calculation."
        checked={useWatch({ control: form.control, name: "tdsEnabled" }) ?? false}
        onCheckedChange={(checked) => form.setValue("tdsEnabled", checked)}
      />

      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : structure ? "Save salary structure" : "Create salary structure"}
        </Button>
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

function ToggleField({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="rounded-[24px] border border-border bg-surface-subtle p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ink">{label}</p>
          <p className="text-xs text-muted">{description}</p>
        </div>
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
      </div>
    </div>
  );
}
