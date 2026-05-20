'use client';

import Link from 'next/link';
import { Bell, Building2, Clock3, LayoutDashboard, LogOut, MoreHorizontal, Phone } from 'lucide-react';
import { signOutAction } from '../app/actions/auth';
import { MobileNav } from './mobile-nav';
import { Button } from './ui';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads', icon: Phone },
  { href: '/properties', label: 'Properties', icon: Building2 },
  { href: '/followups', label: 'Follow-ups', icon: Clock3 },
  { href: '/more', label: 'More', icon: MoreHorizontal },
];

export function AppShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-24 pt-4 sm:px-6 lg:px-8 lg:pb-8">
      <header className="sticky top-4 z-30 mb-4 rounded-[1.75rem] border border-white/10 bg-slate-950/80 px-4 py-4 shadow-2xl shadow-black/30 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">EstateFlow CRM</p>
            <h1 className="text-lg font-semibold text-white">{title}</h1>
            {subtitle ? <p className="text-sm text-slate-400">{subtitle}</p> : null}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/team" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
              <Bell className="h-4 w-4" />
              Alerts
            </Link>
            <form action={signOutAction}>
              <Button type="submit" className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-950">
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <MobileNav items={navItems} />
    </div>
  );
}
