import { Filter, FolderInput, Sparkles } from "lucide-react";
import { BankImportForm } from "@/components/bank/bank-import-form";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDashboardData } from "@/lib/data/queries";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function BankPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Bank operations"
        title="Import, normalize, and clear statement lines"
        description="CSV import with deduplication, saved narration rules, GST/TDS flags, and fast review for salary, vendor, and office spend."
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <FolderInput className="h-4 w-4" />
                Import statement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Bank statement import</DialogTitle>
                <DialogDescription>Set mapping once, then post the CSV to the import route for normalization and duplicate detection.</DialogDescription>
              </DialogHeader>
              <BankImportForm />
            </DialogContent>
          </Dialog>
        }
      />

      <section className="grid gap-4 lg:grid-cols-4">
        {[
          ["Imported rows", data.bankImports[0]?.rowCount ?? 0, "Across the latest statement batch"],
          ["Duplicates removed", data.bankImports[0]?.deduplicatedCount ?? 0, "Fingerprint on date, ref, amount, narration"],
          ["Saved rules", data.savedRules.length, "Auto-suggestions from reviewed history"],
          ["Review queue", data.bankTransactions.filter((txn) => txn.status !== "matched").length, "Transactions still needing operator attention"],
        ].map(([title, value, meta]) => (
          <Card key={title as string}>
            <CardHeader className="pb-2">
              <CardDescription>{title as string}</CardDescription>
              <CardTitle className="text-3xl">{String(value)}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted">{meta as string}</CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Transaction review table</CardTitle>
              <CardDescription>Designed to behave like a clean finance review inbox, not a crowded ERP ledger.</CardDescription>
            </div>
            <Button variant="secondary" size="sm">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Narration</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.bankTransactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell>{formatDate(txn.postedAt)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{txn.narration}</p>
                        <p className="text-xs text-muted">{txn.referenceNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{txn.type.replaceAll("_", " ")}</TableCell>
                    <TableCell className={txn.direction === "credit" ? "text-emerald-700" : ""}>
                      {txn.direction === "credit" ? "+" : "-"}{formatCurrency(txn.amount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {txn.gstFlag ? <Badge variant="warning">GST</Badge> : null}
                        {txn.tdsFlag ? <Badge variant="accent">TDS</Badge> : null}
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={txn.status === "matched" ? "success" : "default"}>{txn.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Saved categorization rules</CardTitle>
              <CardDescription>Rules are kept intentionally simple: narration pattern to type, category, and flags.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.savedRules.map((rule) => (
                <div key={rule.id} className="rounded-[22px] border border-border bg-surface-subtle p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-ink">{rule.name}</p>
                    <Badge variant="accent">{rule.transactionType.replaceAll("_", " ")}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted">{rule.narrationPattern}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Suggestion engine</CardTitle>
              <CardDescription>Known employees and vendors can be auto-linked from narration patterns.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-[22px] border border-border bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-accent-soft p-2 text-accent">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">Suggested link</p>
                    <p className="text-xs text-muted">&quot;ARJUN MEHTA&quot; matched to freelancer vendor record.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
