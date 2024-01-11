/**
 * Setup tables
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
  client_credential_id VARCHAR(1000) NOT NULL,

  -- Crdential use counter (To prevent replay attacks)
  counter INTEGER NOT NULL DEFAULT 0,

  -- Public key (Up to 1000 characters)
  public_key VARCHAR(1000) NOT NULL
);

-- Profiles (Modifying auth.users is considered bad practice, so additonal user data is stored here)
CREATE TABLE public.profiles (
  -- Primary key (Foreign key to auth.users)
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON UPDATE CASCADE ON DELETE CASCADE,

  -- Creation timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

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
  radius DOUBLE PRECISION NOT NULL CHECK (500 <= radius AND radius <= 50000),

  -- Plain-text content (Up to 300 characters)
  content VARCHAR(300) NOT NULL,

  -- Whether or not the post has media (e.g.: an image or video)
  -- Note: media is stored in the `media` bucket with the name `posts/[Post ID]`, where `[Post ID]` refers to the `id` column of this table.
  -- Therefore, media can only be uploaded after a row is inserted into this table and its `id` column is retrieved.
  has_media BOOLEAN NOT NULL DEFAULT FALSE,

  -- Media blur hash (Up to 6 x 8 components)
  blur_hash VARCHAR(100) NULL,

  -- Media aspect ratio (Used to prevent layout shifts)
  aspect_ratio DOUBLE PRECISION NULL CHECK (aspect_ratio IS NULL OR (aspect_ratio > 0 AND aspect_ratio < 10)),

  CHECK (
    (has_media AND blur_hash IS NOT NULL AND aspect_ratio IS NOT NULL) OR
    (NOT has_media AND blur_hash IS NULL AND aspect_ratio IS NULL)
  )
);

-- Post views
CREATE TABLE public.post_views (
  -- Primary key
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Post ID (Foreign key to public.posts)
  post_id UUID NOT NULL REFERENCES public.posts ON UPDATE CASCADE ON DELETE CASCADE,

  -- Viewer user ID (Foreign key to auth.users)
  viewer_id UUID NOT NULL REFERENCES auth.users ON UPDATE CASCADE ON DELETE CASCADE DEFAULT auth.uid(),

  -- Creation timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure the viewer can only view once per post
  UNIQUE (viewer_id, post_id)
);

-- Post votes
CREATE TABLE public.post_votes (
  -- Primary key
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Voter user ID (Foreign key to auth.users)
  voter_id UUID NOT NULL REFERENCES auth.users ON UPDATE CASCADE ON DELETE CASCADE DEFAULT auth.uid(),

  -- Post ID (Foreign key to public.posts)
  post_id UUID NOT NULL REFERENCES public.posts ON UPDATE CASCADE ON DELETE CASCADE,

  -- Creation timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Whether the vote is an upvote (true) or a downvote (false)
  upvote BOOLEAN NOT NULL,

  -- Ensure the voter can only vote once per post
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

  -- Creation timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

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
  content VARCHAR(1000) NOT NULL
);

-- Comment view
CREATE TABLE public.comment_views (
  -- Primary key
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Comment ID (Foreign key to public.comments)
  comment_id UUID NOT NULL REFERENCES public.comments ON UPDATE CASCADE ON DELETE CASCADE,

  -- Viewer user ID (Foreign key to auth.users)
  viewer_id UUID NOT NULL REFERENCES auth.users ON UPDATE CASCADE ON DELETE CASCADE DEFAULT auth.uid(),

  -- Creation timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure the viewer can only view once per comment
  UNIQUE (viewer_id, comment_id)
);

-- Comment votes
CREATE TABLE public.comment_votes (
  -- Primary key
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Voter user ID (Foreign key to auth.users)
  voter_id UUID NOT NULL REFERENCES auth.users ON UPDATE CASCADE ON DELETE CASCADE DEFAULT auth.uid(),

  -- Comment ID (Foreign key to public.comments)
  comment_id UUID NOT NULL REFERENCES public.comments ON UPDATE CASCADE ON DELETE CASCADE,

  -- Creation timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

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

  -- Creation timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure the reporter can only report once per comment
  UNIQUE (reporter_id, comment_id)
);
