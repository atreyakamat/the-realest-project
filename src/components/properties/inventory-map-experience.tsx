'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Badge, Card, Input } from '@/components/ui';
import { Bath, Bed, Building2, Maximize, Search } from 'lucide-react';
import type { PropertyRecord } from '@/lib/estateflow-types';

const PropertyMap = dynamic(() => import('@/components/properties/property-map'), { ssr: false });

type PropertyWithGeo = PropertyRecord & { mapLat: number; mapLng: number };

function hashToCoordinate(seed: string, min: number, max: number) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const normalized = (Math.abs(hash) % 10000) / 10000;
  return min + normalized * (max - min);
}

function deriveCoordinates(property: PropertyRecord): { lat: number; lng: number } {
  if (property.latitude && property.longitude) {
    return { lat: property.latitude, lng: property.longitude };
  }

  const seed = `${property.location ?? ''}-${property.id}`;
  return {
    lat: hashToCoordinate(seed, 28.3, 28.7),
    lng: hashToCoordinate(seed, 76.95, 77.3),
  };
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadiusKm = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildWhatsAppShareText(properties: PropertyWithGeo[]) {
  const lines = properties.slice(0, 8).map((property) => {
    const price = `₹${((property.price ?? 0) / 100000).toFixed(1)}L`;
    return `• ${property.title} (${price}) - ${property.location ?? 'N/A'}: ${window.location.origin}/properties/${property.id}`;
  });

  return `Shortlisted properties near selected radius:\n${lines.join('\n')}`;
}

export function InventoryMapExperience({ properties }: { properties: PropertyRecord[] }) {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [centerLat, setCenterLat] = useState(28.5562);
  const [centerLng, setCenterLng] = useState(77.1);
  const [radiusKm, setRadiusKm] = useState(8);
  const [leadPhone, setLeadPhone] = useState('');

  const searchable = useMemo(() => {
    return properties
      .map((property) => {
        const coords = deriveCoordinates(property);
        return {
          ...property,
          mapLat: coords.lat,
          mapLng: coords.lng,
        } as PropertyWithGeo;
      })
      .filter((property) => {
        const term = search.trim().toLowerCase();
        if (!term) return true;
        const haystack = `${property.title} ${property.location ?? ''} ${property.address ?? ''}`.toLowerCase();
        return haystack.includes(term);
      });
  }, [properties, search]);

  const inRadius = useMemo(() => {
    return searchable.filter((property) => haversineKm(centerLat, centerLng, property.mapLat, property.mapLng) <= radiusKm);
  }, [searchable, centerLat, centerLng, radiusKm]);

  const handleOneClickShare = () => {
    if (!leadPhone.trim() || inRadius.length === 0) return;
    const message = encodeURIComponent(buildWhatsAppShareText(inRadius));
    const normalizedPhone = leadPhone.replace(/[^\d+]/g, '');
    window.open(`https://wa.me/${normalizedPhone.replace('+', '')}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Inventory</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-full px-4 py-2 text-sm ${viewMode === 'grid' ? 'bg-emerald-400 text-slate-950' : 'bg-white/5 text-slate-300'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`rounded-full px-4 py-2 text-sm ${viewMode === 'map' ? 'bg-emerald-400 text-slate-950' : 'bg-white/5 text-slate-300'}`}
            >
              Map
            </button>
            <Badge className="bg-emerald-400/10 text-emerald-400">{searchable.length} Active</Badge>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search inventory..." className="pl-10" />
          </div>
          <Input
            value={leadPhone}
            onChange={(event) => setLeadPhone(event.target.value)}
            placeholder="Lead WhatsApp (for one-click share)"
          />
          <button
            onClick={handleOneClickShare}
            disabled={!leadPhone.trim() || inRadius.length === 0}
            className="rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
          >
            Send {inRadius.length} in radius
          </button>
        </div>
      </header>

      {viewMode === 'map' ? (
        <Card className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <Input type="number" step="0.0001" value={centerLat} onChange={(event) => setCenterLat(Number(event.target.value))} placeholder="Center lat" />
            <Input type="number" step="0.0001" value={centerLng} onChange={(event) => setCenterLng(Number(event.target.value))} placeholder="Center lng" />
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Radius</p>
              <input
                type="range"
                min={1}
                max={30}
                value={radiusKm}
                onChange={(event) => setRadiusKm(Number(event.target.value))}
                className="mt-2 w-full"
              />
              <p>{radiusKm} km</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">In radius</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-300">{inRadius.length}</p>
            </div>
          </div>

          <PropertyMap properties={inRadius} center={[centerLat, centerLng]} radiusKm={radiusKm} />
        </Card>
      ) : null}

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {searchable.map((prop) => (
            <Link key={prop.id} href={`/properties/${prop.id}`}>
              <Card className="group overflow-hidden p-0">
                <div className="relative flex aspect-video items-center justify-center bg-slate-800">
                  <Building2 className="h-12 w-12 text-slate-700 transition-transform group-hover:scale-110" />
                  <div className="absolute right-3 top-3">
                    <Badge className="border-white/10 bg-slate-950/80 text-[10px]">{prop.property_type}</Badge>
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <div>
                    <h3 className="truncate font-bold transition-colors group-hover:text-emerald-400">{prop.title}</h3>
                    <p className="mt-1 text-xs text-slate-400">{prop.location}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Bed className="h-3.5 w-3.5 text-emerald-400/60" />
                        {prop.bedrooms}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Bath className="h-3.5 w-3.5 text-emerald-400/60" />
                        {prop.bathrooms}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Maximize className="h-3.5 w-3.5 text-emerald-400/60" />
                        {prop.size}
                      </div>
                    </div>
                    <p className="text-sm font-bold text-emerald-400">₹{((prop.price || 0) / 100000).toFixed(1)}L</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
