'use client';

import { Card } from '../ui';

export function PerformanceChart() {
  const data = [40, 70, 45, 90, 65, 80, 85];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <Card className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Weekly Performance</h3>
        <span className="text-xs font-semibold text-emerald-400">+12% vs last week</span>
      </div>
      
      <div className="flex h-32 items-end justify-between gap-2 px-2">
        {data.map((value, i) => (
          <div key={i} className="group relative flex flex-1 flex-col items-center gap-2">
            <div 
              className="w-full rounded-t-lg bg-emerald-400/20 transition-all group-hover:bg-emerald-400" 
              style={{ height: `${value}%` }} 
            />
            <span className="text-[10px] font-medium text-slate-500">{days[i]}</span>
            
            {/* Tooltip */}
            <div className="absolute -top-8 hidden rounded bg-slate-900 px-2 py-1 text-[10px] font-bold group-hover:block">
              {value} leads
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
