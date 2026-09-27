CREATE TABLE compare_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  listing_ids JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
