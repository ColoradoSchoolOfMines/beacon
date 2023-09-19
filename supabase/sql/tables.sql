/**
 * Setup tables and indexes
 *
 * Prerequisites: before.sql, functions.sql
 */

/* ---------------------------------------- Setup tables --------------------------------------- */

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

  -- Plain-text content (Maximum length of 300 characters)
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

  -- Comment content (Maximum length of 1000 characters)
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