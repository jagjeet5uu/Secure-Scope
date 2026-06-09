import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card } from "@/components/ui";
import { CalendarPlus } from "lucide-react";

const rows = [
  ["DR-1024", "Asha Mehta", "Active", "2026-05-21", "₹25,000"],
  ["ER-2201", "Neha Kapoor", "Expiring", "2026-05-19", "₹10,000"]
];

export default function ReservationsPage() {
  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reservations</h1>
          <p className="text-sm text-muted-foreground">Available products can be locked for one customer and automatically released after expiry.</p>
        </div>
        <Button><CalendarPlus size={16} /> New reservation</Button>
      </div>
      <Card className="overflow-auto p-4">
        <table className="crm-table w-full text-sm">
          <thead className="text-left text-muted-foreground"><tr>{["SKU", "Customer", "Status", "Reserved until", "Advance"].map((h) => <th key={h} className="border-b border-border px-3 py-2">{h}</th>)}</tr></thead>
          <tbody>{rows.map((row) => <tr key={row[0]} className="border-b border-border last:border-0">{row.map((cell, index) => <td key={cell} className="px-3 py-3">{index === 2 ? <Badge>{cell}</Badge> : cell}</td>)}</tr>)}</tbody>
        </table>
      </Card>
    </AppShell>
  );
}
