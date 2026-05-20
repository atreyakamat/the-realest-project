import { getProperties } from "@/lib/data";
import { Card, Badge, Input } from "@/components/ui";
import { 
  Search, 
  Filter, 
  ChevronRight, 
  Building2, 
  Bed, 
  Bath, 
  Maximize,
  CircleDollarSign
} from "lucide-react";
import Link from "next/link";

export default async function PropertiesPage() {
  const properties = await getProperties(null);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Inventory</h1>
          <Badge className="bg-emerald-400/10 text-emerald-400">{properties.length} Active</Badge>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input placeholder="Search inventory..." className="pl-10" />
          </div>
          <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-400">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((prop) => (
          <Link key={prop.id} href={`/properties/${prop.id}`}>
            <Card className="p-0 overflow-hidden group">
              <div className="aspect-video relative bg-slate-800 flex items-center justify-center">
                <Building2 className="h-12 w-12 text-slate-700 group-hover:scale-110 transition-transform" />
                <div className="absolute top-3 right-3">
                  <Badge className="bg-slate-950/80 backdrop-blur border-white/10 text-[10px]">
                    {prop.property_type}
                  </Badge>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold truncate group-hover:text-emerald-400 transition-colors">{prop.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{prop.location}</p>
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
                  <p className="text-sm font-bold text-emerald-400">₹{((prop.price ?? 0) / 100000).toFixed(1)}L</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
