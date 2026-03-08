"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { saveInvoiceAction } from "@/app/actions";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { invoiceSchema, type InvoiceFormInput, type InvoiceFormValues } from "@/lib/validation/schemas";
import type { Invoice } from "@/lib/types/domain";

export function InvoiceForm({ invoice }: { invoice?: Invoice }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const form = useForm<InvoiceFormInput, unknown, InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceNumber: invoice?.invoiceNumber ?? "",
      issueDate: invoice?.issueDate ?? "",
      dueDate: invoice?.dueDate ?? "",
      customerName: invoice?.customerName ?? "",
      customerAddress: invoice?.customerAddress ?? "",
      gstin: invoice?.gstin ?? "",
      notes: invoice?.notes ?? "",
      status: invoice?.status ?? "draft",
      lineItems: invoice?.lineItems ?? [{ description: "", quantity: 1, rate: 0, taxPercent: 18 }],
    },
  });

  const lineItems = useFieldArray({ control: form.control, name: "lineItems" });

  const onSubmit = form.handleSubmit((values) => {
    setIsPending(true);
    startTransition(async () => {
      const result = await saveInvoiceAction({ ...values, id: invoice?.id });
      setIsPending(false);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
      if (!invoice) {
        form.reset();
      }
    });
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Invoice number"><Input {...form.register("invoiceNumber")} /></Field>
        <Field label="Status">
          <Select defaultValue={form.getValues("status")} onValueChange={(value) => form.setValue("status", value as InvoiceFormValues["status"])}>
            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Issue date"><Input type="date" {...form.register("issueDate")} /></Field>
        <Field label="Due date"><Input type="date" {...form.register("dueDate")} /></Field>
        <Field label="Customer name"><Input {...form.register("customerName")} /></Field>
        <Field label="GSTIN"><Input {...form.register("gstin")} /></Field>
        <div className="md:col-span-2">
          <Field label="Customer address"><Textarea {...form.register("customerAddress")} className="min-h-[88px]" /></Field>
        </div>
      </div>

      <div className="rounded-[24px] border border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Line items</p>
            <p className="text-xs text-muted">GST stays item-level for simple invoice output.</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => lineItems.append({ description: "", quantity: 1, rate: 0, taxPercent: 18 })}
          >
            <Plus className="h-4 w-4" />
            Add line
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {lineItems.fields.map((field, index) => (
            <div key={field.id} className="grid gap-3 rounded-[20px] border border-border bg-surface-subtle p-4 md:grid-cols-[2fr_repeat(3,1fr)_auto]">
              <Input placeholder="Description" {...form.register(`lineItems.${index}.description`)} />
              <Input type="number" step="1" placeholder="Qty" {...form.register(`lineItems.${index}.quantity`)} />
              <Input type="number" step="0.01" placeholder="Rate" {...form.register(`lineItems.${index}.rate`)} />
              <Input type="number" step="0.01" placeholder="Tax %" {...form.register(`lineItems.${index}.taxPercent`)} />
              <Button type="button" variant="ghost" size="icon" onClick={() => lineItems.remove(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Field label="Notes"><Textarea {...form.register("notes")} className="min-h-[88px]" /></Field>
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : invoice ? "Save invoice" : "Create invoice"}</Button>
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
