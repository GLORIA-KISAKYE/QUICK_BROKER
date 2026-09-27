CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  house_type TEXT NOT NULL CHECK (house_type IN (
    'SINGLE_ROOM', 'DOUBLE_ROOM', 'SELF_CONTAINED_SINGLE',
    'SELF_CONTAINED_DOUBLE', 'OTHER'
  )),
  rent_amount INTEGER NOT NULL,
  area TEXT NOT NULL,
  distance_from_kiu NUMERIC(5,2),
  transport_time_boda INTEGER,
  transport_time_walk INTEGER,
  electricity TEXT CHECK (electricity IN (
    'INCLUDED', 'SHARED_BILL', 'PERSONAL_BILL'
  )),
  water TEXT CHECK (water IN (
    'INCLUDED', 'SHARED_PAYMENT', 'STUDENT_PAYS', 'COMMUNITY_TAP'
  )),
  kitchen TEXT CHECK (kitchen IN ('PRESENT', 'NOT_PRESENT')),
  bathroom TEXT CHECK (bathroom IN ('PRIVATE', 'SHARED')),
  toilet TEXT CHECK (toilet IN ('PRIVATE', 'SHARED')),
  flooring TEXT CHECK (flooring IN ('TILED', 'CEMENTED')),
  other_charges TEXT,
  landlord_phone TEXT,
  status TEXT DEFAULT 'AVAILABLE' CHECK (status IN (
    'AVAILABLE', 'INSPECTION_PENDING', 'OCCUPIED', 'SUSPENDED'
  )),
  photos JSONB DEFAULT '[]',
  latitude NUMERIC(10,8),
  longitude NUMERIC(11,8),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
