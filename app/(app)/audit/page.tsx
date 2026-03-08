import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDashboardData } from "@/lib/data/queries";
import { timeAgo } from "@/lib/utils";

export default async function AuditPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Audit trail"
        title="Immutable operational history"
        description="Every sensitive mutation should land here with actor, entity, event, and changed fields snapshot."
      />

      <Card>
        <CardHeader>
          <CardTitle>Recent events</CardTitle>
          <CardDescription>Use this for month-end review, payroll lock verification, and CA support requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell><Badge variant="accent">{log.action}</Badge></TableCell>
                  <TableCell>{log.actorName}</TableCell>
                  <TableCell>{log.entityType}</TableCell>
                  <TableCell>{log.diffSummary}</TableCell>
                  <TableCell>{timeAgo(log.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
