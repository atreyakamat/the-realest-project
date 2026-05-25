'use client';

import { useEffect } from 'react';
import { Circle, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { PropertyRecord } from '@/lib/estateflow-types';

type PropertyWithGeo = PropertyRecord & { mapLat: number; mapLng: number };

export default function PropertyMap({
  properties,
  center,
  radiusKm,
}: {
  properties: PropertyWithGeo[];
  center: [number, number];
  radiusKm: number;
}) {
  useEffect(() => {
    // Fix missing marker icons in Leaflet with Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  return (
    <div className="h-[460px] overflow-hidden rounded-2xl border border-white/10">
      <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Circle center={center} radius={radiusKm * 1000} pathOptions={{ color: '#34d399' }} />

        {properties.map((property) => (
          <Marker key={property.id} position={[property.mapLat, property.mapLng]}>
            <Popup>
              <div>
                <h4 style={{ fontWeight: 700 }}>{property.title}</h4>
                <p>{property.location}</p>
                <p>₹{((property.price ?? 0) / 100000).toFixed(1)}L</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
