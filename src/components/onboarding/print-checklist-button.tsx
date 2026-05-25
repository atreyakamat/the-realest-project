'use client';

import { Printer } from 'lucide-react';

export function PrintChecklistButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950"
    >
      <Printer className="h-4 w-4" />
      Print checklist
    </button>
  );
}