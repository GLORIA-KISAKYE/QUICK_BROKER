-- Remove auto-calculated transport fields (if they exist)
DO $$ BEGIN
  ALTER TABLE listings DROP COLUMN transport_time_boda;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE listings DROP COLUMN transport_time_walk;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Add manual transport info field (landlord enters this)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS transport_info TEXT;

-- Add OSRM distance field (calculated via OSRM, not Haversine)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS osrm_distance_km NUMERIC(5,2);
