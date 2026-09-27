CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  preferred_time TIMESTAMPTZ,
  proposed_time TIMESTAMPTZ,
  status TEXT DEFAULT 'REQUESTED' CHECK (status IN (
    'REQUESTED', 'ACCEPTED', 'DECLINED', 'RESCHEDULED',
    'COMPLETED', 'CANCELLED', 'INTERESTED', 'NOT_INTERESTED', 'RENTED'
  )),
  one_time_code_hash TEXT,
  code_expires_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
