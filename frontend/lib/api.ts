export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return response.json();
}

export type DashboardReport = {
  total_products: number;
  available_products: number;
  reserved_products: number;
  sold_products: number;
  returned_products: number;
  inventory_value: string | number;
  followups_due_today: number;
  overdue_followups: number;
  reservations_expiring_today: number;
  leads_by_stage: Array<{ stage: string; count: number }>;
  recent_sync_errors: Array<{ id: number; module: string; error_message: string; created_at: string }>;
};

export const demoDashboard: DashboardReport = {
  total_products: 869,
  available_products: 500,
  reserved_products: 0,
  sold_products: 265,
  returned_products: 104,
  inventory_value: 0,
  followups_due_today: 12,
  overdue_followups: 5,
  reservations_expiring_today: 3,
  leads_by_stage: [
    { stage: "New Inquiry", count: 18 },
    { stage: "Requirement Collected", count: 9 },
    { stage: "Products Shared", count: 14 },
    { stage: "Reserved", count: 6 },
    { stage: "Quotation Sent", count: 8 }
  ],
  recent_sync_errors: [
    { id: 1, module: "items", error_message: "Inventory tracking missing for item sync.", created_at: "2026-05-19T09:30:00Z" }
  ]
};
