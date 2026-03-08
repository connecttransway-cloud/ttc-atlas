import { Plus } from "lucide-react";
import { VendorForm } from "@/components/vendors/vendor-form";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDashboardData } from "@/lib/data/queries";

export default async function VendorsPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Vendor master"
        title="Freelancers and vendors"
        description="Keep payout counterparties, default categories, and TDS applicability consistent with transaction review and CA exports."
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                New vendor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create vendor</DialogTitle>
                <DialogDescription>Use for both freelancers and vendors linked from bank review.</DialogDescription>
              </DialogHeader>
              <VendorForm categories={data.categories} />
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Vendor list</CardTitle>
          <CardDescription>Deliberately simple, focused on tax treatment and payment linking.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Kind</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Tax IDs</TableHead>
                <TableHead>Flags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.vendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell className="capitalize">{vendor.kind}</TableCell>
                  <TableCell>{vendor.email ?? vendor.phone ?? "No contact yet"}</TableCell>
                  <TableCell>{vendor.gstin ?? vendor.pan ?? "Not recorded"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {vendor.tdsApplicable ? <Badge variant="accent">TDS</Badge> : null}
                      <Badge variant={vendor.active ? "success" : "default"}>{vendor.active ? "Active" : "Inactive"}</Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
