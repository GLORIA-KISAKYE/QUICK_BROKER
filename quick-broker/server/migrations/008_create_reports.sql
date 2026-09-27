CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT CHECK (reason IN ('INACCURATE', 'SUSPICIOUS', 'FAKE', 'OTHER')),
  details TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN (
    'PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'
  )),
  created_at TIMESTAMPTZ DEFAULT now()
);
