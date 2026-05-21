import { InventoryMapExperience } from '@/components/properties/inventory-map-experience';
import { getProperties } from '@/lib/data';

export default async function PropertiesPage() {
  const properties = await getProperties(null);

  return <InventoryMapExperience properties={properties} />;
}
