import { AppShell } from "@/components/app-shell";
import { Badge, Card } from "@/components/ui";

const stages = ["New Inquiry", "Contacted", "Requirement Collected", "Products Shared", "Shortlisted", "Reserved", "Quotation Sent"];

export default function LeadsPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Lead pipeline</h1>
        <p className="text-sm text-muted-foreground">Track inquiry stages, product shortlists, follow-up dates, reservations, and quotation conversion.</p>
      </div>
      <div className="grid min-w-full gap-3 overflow-x-auto xl:grid-cols-7">
        {stages.map((stage, index) => (
          <Card key={stage} className="min-h-80 p-3">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">{stage}</h2>
              <Badge>{index + 2}</Badge>
            </div>
            <div className="space-y-3">
              {[0, 1].map((item) => (
                <div key={item} className="rounded-md border border-border bg-white p-3 text-sm">
                  <div className="font-medium">{item ? "Neha Kapoor" : "Asha Mehta"}</div>
                  <div className="text-muted-foreground">Solitaire ring, anniversary purchase</div>
                  <div className="mt-2 text-xs text-muted-foreground">Follow-up: Today</div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
