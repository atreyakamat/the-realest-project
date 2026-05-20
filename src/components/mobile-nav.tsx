'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, LayoutDashboard, MoreHorizontal, Phone, Clock3 } from 'lucide-react';

type NavItem = { href: string; label: string };

function iconForHref(href: string) {
  if (href === '/dashboard' || href === '/') return LayoutDashboard;
  if (href === '/leads') return Phone;
  if (href === '/properties') return Building2;
  if (href === '/followups') return Clock3;
  return MoreHorizontal;
}

export function MobileNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/95 px-3 py-2 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-7xl grid-cols-5 gap-2 rounded-[1.5rem] border border-white/10 bg-white/5 p-2 shadow-2xl shadow-black/30">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = iconForHref(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-3 text-[11px] font-medium transition ${
                active ? 'bg-emerald-400/15 text-emerald-300' : 'text-slate-400'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
