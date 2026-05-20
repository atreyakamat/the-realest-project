import { PropertyComposer } from '@/components/properties/property-composer';
import { Card } from '@/components/ui';

export default function NewPropertyPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Inventory</p>
        <h1 className="text-3xl font-semibold text-white">Add property</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-300">Add a new property to your organization&apos;s inventory.</p>
      </header>

      <Card>
        <PropertyComposer />
      </Card>
    </div>
  );
}
