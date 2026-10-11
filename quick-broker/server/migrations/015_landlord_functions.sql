-- Function to get landlord listings
CREATE OR REPLACE FUNCTION get_landlord_listings(p_landlord_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  house_type TEXT,
  rent_amount INTEGER,
  area TEXT,
  status TEXT,
  photos JSONB,
  created_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT l.id, l.title, l.house_type, l.rent_amount, l.area, l.status, l.photos, l.created_at
  FROM listings l
  WHERE l.landlord_id = p_landlord_id
  ORDER BY l.created_at DESC;
END;
$$;

-- Function to get landlord inspections
CREATE OR REPLACE FUNCTION get_landlord_inspections(p_landlord_id UUID)
RETURNS TABLE (
  id UUID,
  listing_id UUID,
  listing_title TEXT,
  student_name TEXT,
  student_email TEXT,
  preferred_time TIMESTAMPTZ,
  status TEXT,
  created_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT i.id, i.listing_id, l.title, p.name, p.email, i.preferred_time, i.status, i.created_at
  FROM inspections i
  JOIN listings l ON i.listing_id = l.id
  JOIN profiles p ON i.student_id = p.id
  WHERE l.landlord_id = p_landlord_id
  ORDER BY i.created_at DESC;
END;
$$;
