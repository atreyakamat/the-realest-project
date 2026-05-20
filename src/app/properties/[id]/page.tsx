import { Card, Badge } from '@/components/ui';
import { getPropertyById } from '@/lib/data';
import { SharePropertyCard } from '@/components/properties/share-property-card';
import { getLeads, getProperties } from '@/lib/data';

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await getPropertyById(null, id);
  const leads = await getLeads(null);
  const properties = await getProperties(null);

  if (!property) return <div className="p-6 text-white">Property not found</div>;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Inventory</p>
        <h1 className="text-3xl font-semibold text-white">{property.title}</h1>
        <p className="text-sm text-slate-300">{property.location}</p>
      </header>

      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Badge>{property.property_type}</Badge>
          <p className="text-2xl font-semibold text-emerald-300">₹{property.price?.toLocaleString() ?? '-'}</p>
        </div>
        <p className="text-sm text-slate-300">{property.description ?? 'Premium inventory entry managed in EstateFlow.'}</p>
      </Card>

      <Card>
        <SharePropertyCard properties={properties} leads={leads} />
      </Card>
    </div>
  );
}
