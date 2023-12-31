/**
 * Setup types
 */

-- WebAuthn challenge type
CREATE TYPE auth.webauthn_challenge_type AS ENUM (
  -- Registration challenge
  'registration',

  -- Authentication challenge
  'authentication'
)
