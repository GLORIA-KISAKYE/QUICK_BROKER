-- Seed admin user (email: admin@quickbroker.com, password: admin123)
INSERT INTO profiles (email, name, role) VALUES ('admin@quickbroker.com', 'Admin', 'ADMIN');

-- Seed sample listings
INSERT INTO listings (admin_id, title, house_type, rent_amount, area, distance_from_kiu, transport_time_boda, transport_time_walk, electricity, water, kitchen, bathroom, toilet, flooring, landlord_phone, status)
SELECT
  (SELECT id FROM profiles WHERE email = 'admin@quickbroker.com'),
  'Double Room in Kakoba',
  'DOUBLE_ROOM',
  280000,
  'Kakoba',
  1.2,
  8,
  15,
  'SHARED_BILL',
  'COMMUNITY_TAP',
  'PRESENT',
  'SHARED',
  'SHARED',
  'TILED',
  '0700123456',
  'AVAILABLE';

INSERT INTO listings (admin_id, title, house_type, rent_amount, area, distance_from_kiu, transport_time_boda, transport_time_walk, electricity, water, kitchen, bathroom, toilet, flooring, landlord_phone, status)
SELECT
  (SELECT id FROM profiles WHERE email = 'admin@quickbroker.com'),
  'Self-Contained Single in Ishaka Town',
  'SELF_CONTAINED_SINGLE',
  350000,
  'Ishaka Town',
  0.8,
  5,
  10,
  'PERSONAL_BILL',
  'INCLUDED',
  'PRESENT',
  'PRIVATE',
  'PRIVATE',
  'TILED',
  '0700234567',
  'AVAILABLE';

INSERT INTO listings (admin_id, title, house_type, rent_amount, area, distance_from_kiu, transport_time_boda, transport_time_walk, electricity, water, kitchen, bathroom, toilet, flooring, landlord_phone, status)
SELECT
  (SELECT id FROM profiles WHERE email = 'admin@quickbroker.com'),
  'Single Room near Campus',
  'SINGLE_ROOM',
  180000,
  'KIU Area',
  0.5,
  3,
  6,
  'SHARED_BILL',
  'COMMUNITY_TAP',
  'NOT_PRESENT',
  'SHARED',
  'SHARED',
  'CEMENTED',
  '0700345678',
  'AVAILABLE';
