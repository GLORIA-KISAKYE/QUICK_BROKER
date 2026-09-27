CREATE OR REPLACE FUNCTION accept_inspection(p_inspection_id UUID)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  new_code TEXT;
BEGIN
  new_code := lpad(floor(random() * 1000000)::TEXT, 6, '0');
  UPDATE inspections
  SET status = 'ACCEPTED',
      one_time_code_hash = crypt(new_code, gen_salt('bf')),
      code_expires_at = now() + INTERVAL '24 hours'
  WHERE id = p_inspection_id;
  RETURN new_code;
END;
$$;

CREATE OR REPLACE FUNCTION verify_inspection_code(p_inspection_id UUID, p_code TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE inspections
  SET status = 'COMPLETED', verified_at = now()
  WHERE id = p_inspection_id
    AND one_time_code_hash = crypt(p_code, one_time_code_hash)
    AND code_expires_at > now();
  RETURN FOUND;
END;
$$;
