import { Paperclip } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data/queries";

export default async function DocumentsPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Document vault"
        title="Proofs, statements, and generated PDFs"
        description="Supabase Storage is organized so CA exports can gather supporting evidence without manual chasing."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {data.documents.map((document) => (
          <Card key={document.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="rounded-2xl bg-accent-soft p-2 text-accent">
                  <Paperclip className="h-4 w-4" />
                </div>
                <Badge variant="accent">{document.kind.replaceAll("_", " ")}</Badge>
              </div>
              <CardTitle className="mt-3 text-base">{document.name}</CardTitle>
              <CardDescription>{document.storagePath}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted">Linked to {document.linkedEntity} • {document.linkedId}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
