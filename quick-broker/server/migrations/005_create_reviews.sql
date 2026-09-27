CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  accuracy_rating INTEGER CHECK (accuracy_rating BETWEEN 1 AND 5),
  water_rating INTEGER CHECK (water_rating BETWEEN 1 AND 5),
  electricity_rating INTEGER CHECK (electricity_rating BETWEEN 1 AND 5),
  location_rating INTEGER CHECK (location_rating BETWEEN 1 AND 5),
  comment TEXT,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(inspection_id)
);
