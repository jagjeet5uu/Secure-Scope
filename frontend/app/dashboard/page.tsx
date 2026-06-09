import { AppShell } from "@/components/app-shell";
import { Badge, Card, LinkButton } from "@/components/ui";
import { demoDashboard, type DashboardReport } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, CalendarClock, Gem, PackageCheck, PackageX, Plus, RefreshCcw, ShoppingBag } from "lucide-react";

async function getDashboard(): Promise<DashboardReport> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"}/reports/dashboard`, { cache: "no-store" });
    if (!response.ok) return demoDashboard;
    return response.json();
  } catch {
    return demoDashboard;
  }
}

export default async function DashboardPage() {
  const report = await getDashboard();
  const kpis = [
    { label: "Total products", value: report.total_products, icon: Gem },
    { label: "Available", value: report.available_products, icon: PackageCheck },
    { label: "Reserved", value: report.reserved_products, icon: ShoppingBag },
    { label: "Sold", value: report.sold_products, icon: PackageX },
    { label: "Returned", value: report.returned_products, icon: RefreshCcw },
    { label: "Inventory value", value: formatCurrency(report.inventory_value), icon: Gem }
  ];

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Live CRM summary with fallback values from the Zoho Books item export observations.</p>
        </div>
        <div className="flex gap-2">
          <LinkButton href="/products/import">
            <Plus size={16} /> Import Zoho CSV
          </LinkButton>
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        {kpis.map((item) => (
          <Card key={item.label} className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <item.icon size={17} className="text-primary" />
            </div>
            <div className="text-2xl font-semibold">{item.value}</div>
          </Card>
        ))}
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.4fr_.8fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Leads by stage</h2>
              <p className="text-sm text-muted-foreground">Pipeline distribution across inquiry, shortlist, reservation, and quotation stages.</p>
            </div>
            <Badge>CRM</Badge>
          </div>
          <div className="space-y-3">
            {report.leads_by_stage.map((stage) => (
              <div key={stage.stage}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{stage.stage}</span>
                  <span className="font-medium">{stage.count}</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(stage.count * 5, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-4">
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <CalendarClock size={18} className="text-primary" />
              <h2 className="font-semibold">Follow-ups</h2>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-muted p-3">
                <div className="text-2xl font-semibold">{report.followups_due_today}</div>
                <div className="text-xs text-muted-foreground">Due today</div>
              </div>
              <div className="rounded-md bg-muted p-3">
                <div className="text-2xl font-semibold">{report.overdue_followups}</div>
                <div className="text-xs text-muted-foreground">Overdue</div>
              </div>
              <div className="rounded-md bg-muted p-3">
                <div className="text-2xl font-semibold">{report.reservations_expiring_today}</div>
                <div className="text-xs text-muted-foreground">Expiring</div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-destructive" />
              <h2 className="font-semibold">Recent sync errors</h2>
            </div>
            <div className="space-y-3">
              {report.recent_sync_errors.map((error) => (
                <div key={error.id} className="rounded-md border border-border p-3 text-sm">
                  <div className="font-medium">{error.module}</div>
                  <div className="text-muted-foreground">{error.error_message}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </AppShell>
  );
}
