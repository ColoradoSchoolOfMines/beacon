/**
 * Setup tables and indexes
 *
 * Prerequisites: before.sql, functions.sql, types.sql
 */

/* ---------------------------------------- Setup tables --------------------------------------- */

-- WebAuthn challenges
CREATE TABLE auth.webauthn_challenges (
  -- Primary key
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Creation timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Challenge type
  type auth.webauthn_challenge_type NOT NULL,

  -- Challenge (Up to 100 characters)
  challenge VARCHAR(100) NOT NULL
);

-- WebAuthn credentials
CREATE TABLE auth.webauthn_credentials (
  -- Primary key
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User ID (Foreign key to auth.users)
  user_id UUID NOT NULL REFERENCES auth.users ON UPDATE CASCADE ON DELETE CASCADE,

  -- Creation timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Client-side credential ID (Up to 1000 characters)
  credential_id VARCHAR(1000) NOT NULL,

  -- Crdential use counter (To prevent replay attacks)
  counter INTEGER NOT NULL DEFAULT 0,

  -- Public key (Up to 1000 characters)
  public_key VARCHAR(1000) NOT NULL
);

-- Country metadata
CREATE TABLE public.countries (
  -- Primary key
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Country name (Up to 100 characters)
  name VARCHAR(100) NOT NULL,

  -- ISO 3166-1 Alpha-2 code (Exactly 2 characters)
  alpha2 CHAR(2) NOT NULL,

  -- ISO 3166-1 Alpha-3 code (Exactly 3 characters)
  alpha3 CHAR(3) NOT NULL,

  -- ISO 3166-1 Numeric code
  numeric INTEGER NOT NULL,

  -- IANA country-code top-level domain (Exactly 2 characters)
  tld CHAR(2) NULL,

  -- International dialing codes
  dialing_codes TEXT[] NOT NULL
);

-- Telecom carriers
CREATE TABLE public.telecom_carriers (
  -- Primary key
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Country ID (Foreign key to public.countries)
  country_id UUID NOT NULL REFERENCES public.countries ON UPDATE CASCADE ON DELETE CASCADE,

  -- Carrier name (Up to 100 characters)
  name VARCHAR(100) NOT NULL,

  -- SMS-SMTP gatways (Mustache templates)
  sms_gateways TEXT[] NOT NULL,

  -- MMS-SMTP gatways (Mustache templates)
  mms_gateways TEXT[] NOT NULL,

  -- Combined gateways (Mustache templates)
  gateways TEXT[] NOT NULL GENERATED ALWAYS AS (
    ARRAY_CAT(sms_gateways, mms_gateways)
  ) STORED
);

-- Profiles (Modifying auth.users is considered bad practice, so additonal user data is stored here)
CREATE TABLE public.profiles (
  -- Primary key (Foreign key to auth.users)
  id UUID NOT NULL REFERENCES auth.users ON UPDATE CASCADE ON DELETE CASCADE,

  -- Random color
  color TEXT NOT NULL DEFAULT utilities.get_random_color(),

  -- Random emoji
  emoji TEXT NOT NULL DEFAULT utilities.get_random_emoji()
);

-- User locations
CREATE TABLE public.locations (
  -- Primary key
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User ID (Foreign key to auth.users)
  user_id UUID NOT NULL REFERENCES auth.users ON UPDATE CASCADE ON DELETE CASCADE DEFAULT auth.uid(),

  -- Creation timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() CHECK (created_at <= NOW()),

  -- Location (EPSG4326 - used by the W3C geolocation API)
  location GEOGRAPHY(POINT, 4326) NOT NULL
);

-- Posts
CREATE TABLE public.posts (
  -- Primary key
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Private poster user ID (Foreign key to auth.users)
  private_poster_id UUID NOT NULL REFERENCES auth.users ON UPDATE CASCADE ON DELETE CASCADE DEFAULT auth.uid(),

  -- Whether or not the post is anonymous
  private_anonymous BOOLEAN NOT NULL DEFAULT FALSE,

  -- Public poster ID (Only show if the post is not anonymous)
  poster_id UUID NULL GENERATED ALWAYS AS (
    CASE WHEN private_anonymous THEN NULL ELSE private_poster_id END
  ) STORED,

  -- Private post filter location (EPSG4326 - used by the W3C geolocation API)
  private_location GEOGRAPHY(POINT, 4326) NOT NULL DEFAULT utilities.get_latest_location(auth.uid()),

  -- Creation timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() CHECK (created_at <= NOW()),

  -- Filter radius in meters (Clamped between 500 meters and 50 kilometers)
  radius DOUBLE PRECISION NOT NULL CHECK (500 < radius AND radius < 50000),

  -- Plain-text content (Up to 300 characters)
  content VARCHAR(300) NOT NULL,

  -- Whether or not the post has media (e.g.: an image or video)
  -- Note: media is stored in the `media` bucket with the name `posts/[Post ID]`, where `[Post ID]` refers to the `id` column of this table.
  -- Therefore, media can only be uploaded after a row is inserted into this table and its `id` column is retrieved.
  has_media BOOLEAN NOT NULL DEFAULT FALSE,

  -- Number of upvotes
  upvotes INTEGER NOT NULL DEFAULT 0,

  -- Number of downvotes
  downvotes INTEGER NOT NULL DEFAULT 0
);

-- Post votes
CREATE TABLE public.post_votes (
  -- Primary key
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Voter user ID (Foreign key to auth.users)
  voter_id UUID NOT NULL REFERENCES auth.users ON UPDATE CASCADE ON DELETE CASCADE DEFAULT auth.uid(),

  -- Post ID (Foreign key to public.posts)
  post_id UUID NOT NULL REFERENCES public.posts ON UPDATE CASCADE ON DELETE CASCADE,

  -- Whether the vote is an upvote (true) or a downvote (false)
  upvote BOOLEAN NOT NULL,

  -- Voter sure the voter can only vote once per post
  UNIQUE (voter_id, post_id)
);

-- Post reports
CREATE TABLE public.post_reports (
  -- Primary key
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Reporter user ID (Foreign key to auth.users)
  reporter_id UUID NOT NULL REFERENCES auth.users ON UPDATE CASCADE ON DELETE CASCADE DEFAULT auth.uid(),

  -- Post ID (Foreign key to public.posts)
  post_id UUID NOT NULL REFERENCES public.posts ON UPDATE CASCADE ON DELETE CASCADE,

  -- Ensure the reporter can only report once per post
  UNIQUE (reporter_id, post_id)
);

-- Comments (Nestable)
CREATE TABLE public.comments (
  -- Primary key
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Private commenter user ID (Foreign key to auth.users)
  private_commenter_id UUID NOT NULL REFERENCES auth.users ON UPDATE CASCADE ON DELETE CASCADE DEFAULT auth.uid(),

  -- Whether or not the comment is anonymous
  private_anonymous BOOLEAN NOT NULL DEFAULT FALSE,

  -- Public commenter ID (Only show if the comment is not anonymous)
  commenter_id UUID NULL GENERATED ALWAYS AS (
    CASE WHEN private_anonymous THEN NULL ELSE private_commenter_id END
  ) STORED,

  -- Parent post ID (Foreign key to public.posts)
  post_id UUID NOT NULL REFERENCES public.posts ON UPDATE CASCADE ON DELETE CASCADE,

  -- Parent comment ID (Foreign key to public.comments)
  parent_id UUID NULL REFERENCES public.comments ON UPDATE CASCADE ON DELETE CASCADE,

  -- Creation timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() CHECK (created_at <= NOW()),

  -- Comment content (Up to 1000 characters)
  content VARCHAR(1000) NOT NULL,

  -- Number of upvotes
  upvotes INTEGER NOT NULL DEFAULT 0,

  -- Number of downvotes
  downvotes INTEGER NOT NULL DEFAULT 0
);

-- Comment votes
CREATE TABLE public.comment_votes (
  -- Primary key
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Voter user ID (Foreign key to auth.users)
  voter_id UUID NOT NULL REFERENCES auth.users ON UPDATE CASCADE ON DELETE CASCADE DEFAULT auth.uid(),

  -- Comment ID (Foreign key to public.comments)
  comment_id UUID NOT NULL REFERENCES public.comments ON UPDATE CASCADE ON DELETE CASCADE,

  -- Whether the vote is an upvote (true) or a downvote (false)
  upvote BOOLEAN NOT NULL,

  -- Ensure the voter can only vote once per comment
  UNIQUE (voter_id, comment_id)
);

-- Comment reports
CREATE TABLE public.comment_reports (
  -- Primary key
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Reporter user ID (Foreign key to auth.users)
  reporter_id UUID NOT NULL REFERENCES auth.users ON UPDATE CASCADE ON DELETE CASCADE DEFAULT auth.uid(),

  -- Comment ID (Foreign key to public.comments)
  comment_id UUID NOT NULL REFERENCES public.comments ON UPDATE CASCADE ON DELETE CASCADE,

  -- Ensure the reporter can only report once per comment
  UNIQUE (reporter_id, comment_id)
);

/* --------------------------------------- Setup indexes --------------------------------------- */

-- User locations location index
CREATE INDEX locations_location ON public.locations USING GIST (location);

-- Posts location index
CREATE INDEX posts_location ON public.posts USING GIST (private_location);

-- Posts created at index
CREATE INDEX posts_created_at ON public.posts (created_at);

-- Comments created at index
CREATE INDEX comments_created_at ON public.comments (created_at);
