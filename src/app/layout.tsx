import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MobileNav } from "@/components/mobile-nav";
import { LayoutDashboard, Users, Home, CalendarCheck, Menu } from "lucide-react";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EstateFlow CRM",
  description: "Production-ready mobile-first Real Estate CRM",
};

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/leads", label: "Leads" },
  { href: "/properties", label: "Inventory" },
  { href: "/followups", label: "Followups" },
  { href: "/more", label: "More" },
];

function iconForHref(href: string) {
  if (href === "/" ) return LayoutDashboard;
  if (href === "/leads") return Users;
  if (href === "/properties") return Home;
  if (href === "/followups") return CalendarCheck;
  return Menu;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${inter.className} bg-slate-950 text-slate-50 antialiased min-h-full`}>
        <div className="flex min-h-screen flex-col pb-24 lg:pb-0 lg:pl-64">
          <main className="flex-1 p-4 lg:p-8">
            {children}
          </main>
          <MobileNav items={navItems} />
          {/* Desktop Nav Placeholder */}
          <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-slate-900/50 backdrop-blur lg:block">
            <div className="flex h-full flex-col p-6">
              <h1 className="mb-8 text-xl font-bold text-emerald-400">EstateFlow CRM</h1>
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
                  >
                    {(() => {
                      const Icon = iconForHref(item.href);
                      return <Icon className="h-5 w-5" />;
                    })()}
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        </div>
        <Toaster position="top-center" theme="dark" />
      </body>
    </html>
  );
}
