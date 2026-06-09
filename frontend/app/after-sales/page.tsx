import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card } from "@/components/ui";
import { Wrench } from "lucide-react";

export default function AfterSalesPage() {
  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">After-sales service</h1>
          <p className="text-sm text-muted-foreground">Resize, repair, polish, exchange, return, cleaning, and custom modification workflows.</p>
        </div>
        <Button><Wrench size={16} /> New request</Button>
      </div>
      <Card className="grid gap-3 p-5 md:grid-cols-4">
        {["Received", "Inspection", "In Progress", "Ready"].map((status) => (
          <div key={status} className="rounded-md bg-muted p-4">
            <Badge>{status}</Badge>
            <div className="mt-3 text-sm text-muted-foreground">Track customer, product, invoice reference, cost, staff owner, before and after images.</div>
          </div>
        ))}
      </Card>
    </AppShell>
  );
}
