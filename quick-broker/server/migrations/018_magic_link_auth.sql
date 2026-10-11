-- Add magic link tokens table
CREATE TABLE IF NOT EXISTS auth_magic_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_auth_magic_tokens_email ON auth_magic_tokens(email);
CREATE INDEX idx_auth_magic_tokens_token ON auth_magic_tokens(token_hash);
