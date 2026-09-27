CREATE TABLE availability_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  confirmed_available BOOLEAN,
  sent_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ
);
