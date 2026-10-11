-- Create demo users for preview purposes
INSERT INTO profiles (email, name, role) VALUES
  ('demo-student@quickbroker.com', 'Demo Student', 'STUDENT'),
  ('demo-landlord@quickbroker.com', 'Demo Landlord', 'LANDLORD'),
  ('demo-admin@quickbroker.com', 'Demo Admin', 'ADMIN')
ON CONFLICT (email) DO NOTHING;
