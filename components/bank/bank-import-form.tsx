"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { bankImportSchema, type BankImportFormInput, type BankImportFormValues } from "@/lib/validation/schemas";

export function BankImportForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isPending, setIsPending] = useState(false);
  const form = useForm<BankImportFormInput, unknown, BankImportFormValues>({
    resolver: zodResolver(bankImportSchema),
    defaultValues: {
      month: "2026-01",
      hasHeader: true,
      delimiter: ",",
      dateColumn: "Date",
      narrationColumn: "Narration",
      referenceColumn: "Reference",
      creditColumn: "Credit",
      debitColumn: "Debit",
      amountColumn: "",
      balanceColumn: "Balance",
    },
  });
  const hasHeader = useWatch({ control: form.control, name: "hasHeader" });

  const onSubmit = form.handleSubmit((values) => {
    if (!file) {
      toast.error("Select a CSV statement first.");
      return;
    }

    setIsPending(true);
    startTransition(async () => {
      const payload = new FormData();
      payload.append("file", file);
      payload.append("mapping", JSON.stringify(values));
      const response = await fetch("/api/bank/import", {
        method: "POST",
        body: payload,
      });
      const result = await response.json();
      setIsPending(false);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message, {
        description: result.summary ? `${result.summary.duplicateCount} duplicate rows removed.` : undefined,
      });
      router.refresh();
      form.reset();
      setFile(null);
    });
  });

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
      <Field label="Month"><Input placeholder="2026-01" {...form.register("month")} /></Field>
      <Field label="CSV file"><Input type="file" accept=".csv,text/csv" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /></Field>
      <Field label="Delimiter">
        <Select defaultValue={form.getValues("delimiter")} onValueChange={(value) => form.setValue("delimiter", value as BankImportFormValues["delimiter"])}>
          <SelectTrigger><SelectValue placeholder="Select delimiter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value=",">Comma</SelectItem>
            <SelectItem value=";">Semicolon</SelectItem>
            <SelectItem value="	">Tab</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Date column"><Input {...form.register("dateColumn")} /></Field>
      <Field label="Narration column"><Input {...form.register("narrationColumn")} /></Field>
      <Field label="Reference column"><Input {...form.register("referenceColumn")} /></Field>
      <Field label="Credit column"><Input {...form.register("creditColumn")} /></Field>
      <Field label="Debit column"><Input {...form.register("debitColumn")} /></Field>
      <Field label="Balance column"><Input {...form.register("balanceColumn")} /></Field>
      <div className="rounded-[24px] border border-border bg-surface-subtle p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink">First row is header</p>
            <p className="text-xs text-muted">Keeps import mapping operator-friendly for different bank exports.</p>
          </div>
          <Switch checked={hasHeader} onCheckedChange={(checked) => form.setValue("hasHeader", checked)} />
        </div>
      </div>
      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={isPending}>{isPending ? "Importing..." : "Import statement"}</Button>
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
