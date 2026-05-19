-- Seed data for EstateFlow CRM (example/sample data)

-- Create an organization
INSERT INTO organizations (id, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'EstateFlow Demo')
  ON CONFLICT DO NOTHING;

-- Admin profile
INSERT INTO profiles (id, organization_id, email, full_name, phone, role)
VALUES
  ('00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000001','admin@estateflow.test','Admin User','+911234567890','Admin')
ON CONFLICT DO NOTHING;

-- Two agents
INSERT INTO profiles (id, organization_id, email, full_name, phone, role)
VALUES
  ('00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000001','agent1@estateflow.test','Agent One','+919900000001','Sales Agent'),
  ('00000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000001','agent2@estateflow.test','Agent Two','+919900000002','Sales Agent')
ON CONFLICT DO NOTHING;

-- Team members
INSERT INTO team_members (id, organization_id, profile_id, role, is_active)
VALUES
  ('00000000-0000-0000-0000-000000000031','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000021','Sales Agent', true),
  ('00000000-0000-0000-0000-000000000032','00000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000022','Sales Agent', true)
ON CONFLICT DO NOTHING;

-- Sample properties
INSERT INTO properties (id, organization_id, title, location, address, property_type, price, size, bedrooms, bathrooms, description)
VALUES
  ('00000000-0000-0000-0000-000000001001','00000000-0000-0000-0000-000000000001','Golf View 3BHK','Gurgaon','Near Golf Course Road','Apartment', 9500000, '1500 sqft', 3, 3, 'Premium 3BHK near golf course'),
  ('00000000-0000-0000-0000-000000001002','00000000-0000-0000-0000-000000000001','Green Villa','Gurgaon','Sector 55','Villa', 25000000, '3500 sqft', 4, 5, 'Spacious villa with garden')
ON CONFLICT DO NOTHING;

-- Sample leads
INSERT INTO leads (id, organization_id, full_name, phone, email, source, property_type, budget_min, budget_max, preferred_location, notes, status, temperature)
VALUES
  ('00000000-0000-0000-0000-000000100001','00000000-0000-0000-0000-000000000001','Rahul Sharma','+919999999999','rahul@example.com','36 Acre','Apartment',7500000,12000000,'Gurgaon','Looking for 3BHK near Golf Course Road','New','Hot'),
  ('00000000-0000-0000-0000-000000100002','00000000-0000-0000-0000-000000000001','Sneha Gupta','+919888888888','sneha@example.com','Facebook','Villa',20000000,30000000,'Gurgaon','Family needs 4BHK','New','Warm')
ON CONFLICT DO NOTHING;

-- Sample attendance
INSERT INTO attendance (id, organization_id, user_id, check_in_time, status)
VALUES
  ('00000000-0000-0000-0000-000010000001','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000021', now() - interval '1 day','present')
ON CONFLICT DO NOTHING;
