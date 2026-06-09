import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, Input } from "@/components/ui";
import { RefreshCcw, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Settings and Zoho sync</h1>
        <p className="text-sm text-muted-foreground">Manage users, roles, product categories, lead sources, Zoho settings, sync logs, and webhook logs.</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2"><ShieldCheck size={18} className="text-primary" /><h2 className="font-semibold">Zoho Books configuration</h2></div>
          <div className="grid gap-3">
            <Input placeholder="Organization ID" />
            <Input placeholder="API domain" defaultValue="https://www.zohoapis.com/books/v3" />
            <Input placeholder="Redirect URI" />
            <Button><RefreshCcw size={16} /> Test connection</Button>
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 font-semibold">Sync jobs</h2>
          <div className="grid gap-2">
            {["Import all items", "Import contacts", "Sync invoices", "Sync payments", "Retry failed sync"].map((job) => (
              <div key={job} className="flex items-center justify-between rounded-md border border-border p-3">
                <span className="text-sm">{job}</span>
                <Badge>Queued by Celery</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
