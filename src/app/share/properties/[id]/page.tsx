import { getPropertyById } from '@/lib/data';
import { Card, Badge } from '@/components/ui';

export default async function SharedPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await getPropertyById(null, id);

  if (!property) {
    return <div className="p-6 text-white">Property not found</div>;
  }

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Shared property</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">{property.title}</h1>
            <p className="text-sm text-slate-300">{property.location}</p>
          </div>
          <Badge>{property.property_type}</Badge>
        </div>
        <p className="text-sm text-slate-300">{property.description ?? 'Premium listing shared from EstateFlow.'}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Info label="Price" value={`₹${property.price?.toLocaleString() ?? '-'}`} />
          <Info label="Bedrooms" value={String(property.bedrooms ?? '-')} />
          <Info label="Size" value={property.size ?? '-'} />
        </div>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
