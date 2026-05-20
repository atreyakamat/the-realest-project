export type Role =
  | 'Admin'
  | 'Business Owner'
  | 'Sales Manager'
  | 'Sales Agent'
  | 'Field Executive'
  | 'Social Media Manager';

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Interested'
  | 'Site Visit Scheduled'
  | 'Negotiation'
  | 'Won'
  | 'Lost'
  | 'Not Responding';

export type LeadTemperature = 'Cold' | 'Warm' | 'Hot';

export type LeadSource =
  | '36 Acre'
  | 'MagicBricks'
  | 'Housing'
  | 'Facebook'
  | 'Instagram'
  | 'Website'
  | 'Referral'
  | 'Manual'
  | 'Other';

export type PropertyType = 'Apartment' | 'Villa' | 'Plot' | 'Commercial' | 'Rental';

export type AvailabilityStatus = 'Available' | 'Hold' | 'Sold' | 'Rented';

export type LeadRecord = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  source: string | null;
  property_type: string | null;
  budget_min: number | null;
  budget_max: number | null;
  preferred_location: string | null;
  notes: string | null;
  status: string | null;
  temperature: string | null;
  assigned_agent_id: string | null;
  next_followup: string | null;
  created_at: string;
  last_contacted_at: string | null;
};

export type PropertyRecord = {
  id: string;
  title: string;
  location: string | null;
  address: string | null;
  property_type: string | null;
  price: number | null;
  size: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floor: string | null;
  furnishing: string | null;
  availability_status: string | null;
  description: string | null;
  amenities: string[] | null;
  owner_info: Record<string, unknown> | null;
  tags: string[] | null;
  units_available: number | null;
  created_at: string;
};

export type ActivityRecord = {
  id: string;
  type: string;
  payload: Record<string, unknown> | null;
  created_at: string;
};
