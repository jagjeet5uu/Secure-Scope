import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";

const reports = ["Inventory summary", "Stock aging", "Missing SKU", "Missing certification", "Products without images", "Leads by stage", "Follow-up report", "Salesperson performance", "Quotation conversion", "Sync error report"];

export default function ReportsPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">Operational reporting for inventory quality, sales pipeline, quotation conversion, and Zoho sync health.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {reports.map((report) => (
          <Card key={report} className="p-4">
            <h2 className="font-semibold">{report}</h2>
            <p className="mt-2 text-sm text-muted-foreground">Open report</p>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
