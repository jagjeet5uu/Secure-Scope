import { AppShell } from "@/components/app-shell";
import { Button, Card, Input, Select } from "@/components/ui";
import { CheckCircle2, FileSpreadsheet, Upload } from "lucide-react";

export default function ProductImportPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Zoho Books item CSV import</h1>
        <p className="text-sm text-muted-foreground">Upload the initial Zoho Books item export, preview fields, normalize status/category/certification values, and store import errors.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[.8fr_1.2fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-primary" />
            <h2 className="font-semibold">Upload CSV</h2>
          </div>
          <div className="grid gap-4">
            <Input type="file" accept=".csv" />
            <Select>
              <option>Map Zoho Books default export columns</option>
              <option>Use saved custom mapping</option>
            </Select>
            <Button>
              <Upload size={16} /> Preview and validate
            </Button>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 font-semibold">Validation summary</h2>
          <div className="grid gap-3 md:grid-cols-4">
            {[
              ["Total rows", "869"],
              ["Missing SKU", "20"],
              ["Duplicate SKU", "0"],
              ["Missing certification", "Review"]
            ].map(([label, value]) => (
              <div key={label} className="rounded-md bg-muted p-3">
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="text-xl font-semibold">{value}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-2 text-sm">
            {["Normalize CF.Inventory into Available, Reserved, Sold, Returned, Under Service, Archived", "Normalize certification into No, Yes - Generic, IGI, SGL, Hallmark, Unknown", "Keep Zoho active/inactive separate from CRM inventory status"].map((item) => (
              <div key={item} className="flex items-start gap-2 rounded-md border border-border p-3">
                <CheckCircle2 size={16} className="mt-0.5 text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
