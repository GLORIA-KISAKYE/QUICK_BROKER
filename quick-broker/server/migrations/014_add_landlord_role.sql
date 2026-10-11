-- Add LANDLORD role to profiles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('STUDENT', 'LANDLORD', 'ADMIN'));

-- Add landlord verification fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_identity_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS national_id_hash TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add landlord_id to listings
ALTER TABLE listings ADD COLUMN IF NOT EXISTS landlord_id UUID REFERENCES profiles(id);

-- Create landlord verification documents table
CREATE TABLE IF NOT EXISTS landlord_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  national_id_number TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_landlord_verifications_landlord ON landlord_verifications(landlord_id);
CREATE INDEX idx_landlord_verifications_status ON landlord_verifications(status);
CREATE INDEX idx_listings_landlord ON listings(landlord_id);
