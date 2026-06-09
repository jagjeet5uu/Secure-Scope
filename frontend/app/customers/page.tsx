import { AppShell } from "@/components/app-shell";
import { Button, Card, Input } from "@/components/ui";
import { Plus } from "lucide-react";

const customers = [
  ["Asha Mehta", "9876543210", "Mumbai", "Rings", "₹80,000 - ₹2,00,000"],
  ["Rohan Shah", "9820011111", "Ahmedabad", "Bracelets", "₹1,50,000 - ₹3,00,000"],
  ["Neha Kapoor", "9811111111", "Delhi", "Solitaire Rings", "₹2,00,000+"]
];

export default function CustomersPage() {
  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">Billing identity syncs to Zoho Books; preferences and relationship history stay in CRM.</p>
        </div>
        <Button>
          <Plus size={16} /> New customer
        </Button>
      </div>
      <Card className="p-4">
        <div className="mb-4 max-w-md">
          <Input placeholder="Search by name, mobile, or email" />
        </div>
        <div className="overflow-auto">
          <table className="crm-table w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>{["Name", "Mobile", "City", "Preferred category", "Budget"].map((h) => <th key={h} className="border-b border-border px-3 py-2">{h}</th>)}</tr>
            </thead>
            <tbody>
              {customers.map((row) => (
                <tr key={row[1]} className="border-b border-border last:border-0">{row.map((cell) => <td key={cell} className="px-3 py-3">{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
