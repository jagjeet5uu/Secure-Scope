import { AppShell } from "@/components/app-shell";
import { Badge, Card, Input, LinkButton, Select } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { Filter, Upload } from "lucide-react";

const products = [
  { sku: "DR-1024", item_name: "Solitaire Diamond Ring", category: "Solitaire Rings", price: 185000, status: "Available", cert: "IGI" },
  { sku: "ER-2201", item_name: "Small Gold Earrings", category: "Small Earrings", price: 42000, status: "Reserved", cert: "Hallmark" },
  { sku: "BR-0912", item_name: "Diamond Tennis Bracelet", category: "Bracelets", price: 235000, status: "Sold", cert: "SGL" },
  { sku: "", item_name: "Packaging Box", category: "Packaging Material", price: 0, status: "Available", cert: "No" }
];

const statusClass: Record<string, string> = {
  Available: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Reserved: "border-amber-200 bg-amber-50 text-amber-800",
  Sold: "border-slate-200 bg-slate-100 text-slate-700"
};

export default function ProductsPage() {
  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Product catalog</h1>
          <p className="text-sm text-muted-foreground">Jewelry-specific catalog with Zoho item IDs, CRM inventory status, certificates, and image readiness.</p>
        </div>
        <LinkButton href="/products/import">
          <Upload size={16} /> Import CSV
        </LinkButton>
      </div>

      <Card className="mb-4 p-4">
        <div className="grid gap-3 md:grid-cols-5">
          <Input placeholder="SKU or product name" />
          <Select defaultValue="">
            <option value="">Category</option>
            <option>Rings</option>
            <option>Solitaire Rings</option>
            <option>Small Earrings</option>
            <option>Bracelets</option>
            <option>Packaging Material</option>
          </Select>
          <Select defaultValue="">
            <option value="">Inventory status</option>
            <option>Available</option>
            <option>Reserved</option>
            <option>Sold</option>
            <option>Returned</option>
          </Select>
          <Select defaultValue="">
            <option value="">Certification</option>
            <option>IGI</option>
            <option>SGL</option>
            <option>Hallmark</option>
            <option>Unknown</option>
          </Select>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-white px-3 text-sm">
            <Filter size={16} /> Apply filters
          </button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <Card key={`${product.sku}-${product.item_name}`} className="overflow-hidden">
            <div className="grid aspect-[4/3] place-items-center bg-muted text-primary">
              <span className="text-5xl font-semibold">{product.category.slice(0, 1)}</span>
            </div>
            <div className="p-4">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">{product.sku || "Missing SKU"}</div>
                  <h2 className="font-semibold">{product.item_name}</h2>
                </div>
                <Badge className={statusClass[product.status] || ""}>{product.status}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">{product.category}</div>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-semibold">{formatCurrency(product.price)}</span>
                <Badge>{product.cert}</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
