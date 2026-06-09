import { BarChart3, ClipboardList, Gem, Home, RefreshCcw, Settings, ShoppingBag, Users, Wrench } from "lucide-react";
import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/leads", label: "Leads", icon: ClipboardList },
  { href: "/products", label: "Products", icon: Gem },
  { href: "/reservations", label: "Reservations", icon: ShoppingBag },
  { href: "/quotations", label: "Quotations", icon: BarChart3 },
  { href: "/after-sales", label: "After-sales", icon: Wrench },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Zoho Sync", icon: RefreshCcw },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-white lg:block">
        <div className="flex h-16 items-center gap-3 border-b border-border px-5">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground">
            <Gem size={20} />
          </div>
          <div>
            <div className="text-sm font-semibold">Jewelry Brand CRM</div>
            <div className="text-xs text-muted-foreground">Zoho Books connected</div>
          </div>
        </div>
        <nav className="grid gap-1 px-3 py-4">
          {navItems.map((item) => (
            <Link key={`${item.href}-${item.label}`} href={item.href} className="flex h-10 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
              <item.icon size={17} />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-white/95 px-4 backdrop-blur lg:px-8">
          <div>
            <div className="text-sm font-semibold">Gold and Jewelry Operations</div>
            <div className="text-xs text-muted-foreground">Customers, leads, catalog, reservations, quotations, and Zoho sync</div>
          </div>
          <div className="hidden w-80 md:block">
            <input className="h-10 w-full rounded-md border border-input px-3 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Search SKU, customer, lead, invoice" />
          </div>
        </header>
        <div className="px-4 py-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
