"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveVendorAction } from "@/app/actions";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { vendorSchema, type VendorFormValues } from "@/lib/validation/schemas";
import type { Category, Vendor } from "@/lib/types/domain";

export function VendorForm({ vendor, categories }: { vendor?: Vendor; categories: Category[] }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: vendor?.name ?? "",
      kind: vendor?.kind ?? "vendor",
      email: vendor?.email ?? "",
      phone: vendor?.phone ?? "",
      gstin: vendor?.gstin ?? "",
      pan: vendor?.pan ?? "",
      defaultCategoryId: vendor?.defaultCategoryId ?? categories[0]?.id ?? "",
      tdsApplicable: vendor?.tdsApplicable ?? false,
      active: vendor?.active ?? true,
    },
  });
  const tdsApplicable = useWatch({ control: form.control, name: "tdsApplicable" });
  const active = useWatch({ control: form.control, name: "active" });

  const onSubmit = form.handleSubmit((values) => {
    setIsPending(true);
    startTransition(async () => {
      const result = await saveVendorAction({ ...values, id: vendor?.id });
      setIsPending(false);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
      if (!vendor) form.reset();
    });
  });

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
      <Field label="Name"><Input {...form.register("name")} /></Field>
      <Field label="Kind">
        <Select defaultValue={form.getValues("kind")} onValueChange={(value) => form.setValue("kind", value as VendorFormValues["kind"])}>
          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="vendor">Vendor</SelectItem>
            <SelectItem value="freelancer">Freelancer</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Email"><Input {...form.register("email")} /></Field>
      <Field label="Phone"><Input {...form.register("phone")} /></Field>
      <Field label="GSTIN"><Input {...form.register("gstin")} /></Field>
      <Field label="PAN"><Input {...form.register("pan")} /></Field>
      <Field label="Default category">
        <Select defaultValue={form.getValues("defaultCategoryId")} onValueChange={(value) => form.setValue("defaultCategoryId", value)}>
          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <div className="space-y-3 rounded-[24px] border border-border bg-surface-subtle p-4">
        <SwitchRow label="TDS applicable" checked={tdsApplicable} onCheckedChange={(checked) => form.setValue("tdsApplicable", checked)} />
        <SwitchRow label="Active" checked={active} onCheckedChange={(checked) => form.setValue("active", checked)} />
      </div>
      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : vendor ? "Save vendor" : "Create vendor"}</Button>
      </div>
    </form>
  );
}

function SwitchRow({ label, checked, onCheckedChange }: { label: string; checked: boolean; onCheckedChange: (checked: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-ink">{label}</p>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
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
