import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card } from "@/components/ui";
import { FileText } from "lucide-react";

export default function QuotationsPage() {
  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Quotations</h1>
          <p className="text-sm text-muted-foreground">Prepare CRM quotations, generate PDFs, and convert accepted quotations into Zoho Books estimates or invoices.</p>
        </div>
        <Button><FileText size={16} /> New quotation</Button>
      </div>
      <Card className="p-5">
        <div className="grid gap-3 md:grid-cols-3">
          {["Draft", "Sent", "Converted to Invoice"].map((status) => (
            <div key={status} className="rounded-md border border-border p-4">
              <Badge>{status}</Badge>
              <div className="mt-3 text-lg font-semibold">QTN-20260519-{status.length}</div>
              <p className="text-sm text-muted-foreground">Includes shortlisted products, discounts, taxes, and Zoho conversion references.</p>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
