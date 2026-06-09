import "./globals.css";

export const metadata = {
  title: "Jewelry Brand CRM",
  description: "Custom CRM for a gold and jewelry brand with Zoho Books integration"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
