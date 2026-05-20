import Link from 'next/link';
import { Card } from '@/components/ui';

const shortcuts = [
  { href: '/team', label: 'Team' },
  { href: '/attendance', label: 'Attendance' },
  { href: '/reports', label: 'Reports' },
  { href: '/integrations', label: 'Integrations' },
  { href: '/settings', label: 'Settings' },
];

export default function MorePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">More</p>
        <h1 className="text-3xl font-semibold text-white">More tools</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-300">Jump into admin and reporting utilities.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shortcuts.map((item) => (
          <Card key={item.href} className="flex items-center justify-between">
            <span className="font-medium text-white">{item.label}</span>
            <Link href={item.href} className="text-sm text-emerald-300">Open</Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
