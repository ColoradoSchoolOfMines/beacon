/**
 * Setup Supabase
 */

/* --------------------------------------- Setup schemas --------------------------------------- */

-- Public
REVOKE ALL ON SCHEMA public FROM anon, authenticated;

-- Utilities (Non-public helper functions)
CREATE SCHEMA IF NOT EXISTS utilities;
REVOKE ALL ON SCHEMA utilities FROM anon, authenticated;

/* -------------------------------------- Setup extensions ------------------------------------- */

-- PostGIS
CREATE EXTENSION
IF NOT EXISTS postgis
WITH SCHEMA extensions;

/* --------------------------------- Setup functions/procedures -------------------------------- */

-- Generate a random double precision number between 0 (inclusive) and 1 (exclusive), using crypto-safe random data
CREATE OR REPLACE FUNCTION utilities.safe_random()
RETURNS DOUBLE PRECISION
VOLATILE
LANGUAGE plpgsql
AS $$
DECLARE
  -- Maximum value of a BIGINT as a double precision number
  _max CONSTANT DOUBLE PRECISION := (~(1::BIGINT << 63))::DOUBLE PRECISION;

  -- Current random value
  _value DOUBLE PRECISION;
BEGIN
  LOOP
    -- Generate 8 crypto-safe random bytes, convert them to a bit string, set the MSB to 0 (Make positive), convert to a double, and normalize
    _value = SET_BIT(RIGHT(extensions.gen_random_bytes(8)::TEXT, -1)::BIT(64), 0, 0)::BIGINT::DOUBLE PRECISION / _max;

    -- Return if the value is not 1 (The probability of this happening is near 0, but this guarentees the returned value is never 1)
    IF _value < 1 THEN
      RETURN _value;
    END IF;
  END LOOP;
END;
$$;

-- Get a random color
CREATE OR REPLACE FUNCTION utilities.get_random_color()
RETURNS TEXT
VOLATILE
LANGUAGE plpgsql
AS $$
DECLARE
  -- Possible colors (Select Tailwind colors using the 300, 500, and 800 variants; similar colors have been removed)
  _colors CONSTANT TEXT[] := ARRAY[
    -- Reds
    '#fca5a5', '#ef4444', '#991b1b',

    -- Oranges
    '#fdba74', '#f97316', '#9a3412',

    -- Yellows
    '#fde047', '#eab308', '#854d0e',

    -- Limes
    '#bef264', '#84cc16', '#3f6212',

    -- Greens
    '#86efac', '#22c55e', '#166534',

    -- Emeralds
    '#6ee7b7', '#10b981', '#065f46',

    -- Teals
    '#5eead4', '#14b8a6', '#115e59',

    -- Skies
    '#7dd3fc', '#0ea5e9', '#075985',

    -- Blues
    '#93c5fd', '#3b82f6', '#1e40af',

    -- Indigos
    '#a5b4fc', '#6366f1', '#3730a3',

    -- Purples
    '#d8b4fe', '#a855f7', '#6b21a8',

    -- Fuchsias
    '#f0abfc', '#d946ef', '#86198f'
  ];

  -- Color length
  _color_length CONSTANT INTEGER := ARRAY_LENGTH(_colors, 1);
BEGIN
  RETURN _colors[FLOOR(utilities.safe_random() * _color_length) + 1];
END;
$$;

-- Get a random emoji
CREATE OR REPLACE FUNCTION utilities.get_random_emoji()
RETURNS TEXT
VOLATILE
LANGUAGE plpgsql
AS $$
DECLARE
  -- Possible emojis (Similar, hard-to-identify, or any other emojis that would otherwise be strange to use for an avatar have been removed)
  _emojis CONSTANT TEXT[] := ARRAY[
    '⌚️', '⏰', '⏳', '☀️', '☁️', '☢️', '☣️', '♻️', '⚓️', '⚛️', '⚠️', '⚡️', '⚽️', '⚾️', '⛄️', '⛏', '⛔️', '⛩', '⛰', '⛱', '⛳️', '⛵️', '⛸', '✂️', '✅', '✈️', '❄️', '❌', '❎', '❓', '❗️', '❤️', '⭐️', '⭕️', '🌈', '🌊', '🌋', '🌎', '🌐', '🌑', '🌕', '🌗', '🌡', '🌪', '🌱', '🌲', '🌳', '🌴', '🌵', '🌶', '🌷', '🌻', '🌽', '🍀', '🍁', '🍂', '🍄', '🍅', '🍆', '🍇', '🍉', '🍊', '🍋', '🍌', '🍍', '🍎', '🍐', '🍑', '🍒', '🍓', '��', '🍥', '🍦', '🍩', '🍪', '🍫', '🍬', '🍭', '🍰', '🍷', '🍸', '🍺', '🍿', '🎀', '🎁', '🎃', '🎈', '🎉', '🎗', '🎟', '🎡', '🎢', '🎤', '🎥', '🎧', '🎨', '🎩', '🎪', '🎬', '🎭', '🎮', '🎯', '🎰', '🎱', '🎲', '🎳', '🎵', '🎷', '🎸', '🎹', '🎺', '🎻', '🏀', '🏅', '🏆', '🏈', '🏉', '🏍', '🏐', '🏓', '��', '🏕', '🏗', '🏝', '🏟', '🏠', '🏢', '🏭', '🏮', '🏯', '🏰', '🏹', '🐁', '🐅', '🐇', '🐊', '🐌', '🐍', '🐏', '🐐', '🐑', '🐓', '🐔', '🐗', '🐘', '🐙', '🐚', '🐛', '🐜', '🐝', '🐞', '🐟', '🐡', '🐢', '🐤', '🐦', '🐦‍⬛', '🐧', '🐨', '🐫', '🐬', '🐭', '🐮', '🐯', '🐰', '🐱', '🐳', '🐴', '🐵', '🐶', '🐷', '🐸', '🐹', '🐺', '🐻', '🐻‍❄️', '🐼', '🐿', '👑', '👽', '💀', '💈', '💎', '💙', '💚', '��', '💜', '💡', '💢', '💣', '💥', '💧', '💯', '💰', '💵', '💸', '📈', '📉', '📌', '📎', '📜', '📡', '📣', '📦', '📫', '📸', '🔆', '🔊', '🔍', '🔑', '🔒', '🔔', '🔗', '🔥', '🔦', '🔩', '🔪', '🔫', '🔬', '🔭', '🔮', '🔱', '🕷', '🕹', '🖊', '🖌', '🖍', '🖤', '🗡', '🗺', '🗻', '🗼', '🗽', '🗿', '🚀', '��', '🚂', '🚌', '🚑', '🚒', '🚓', '🚕', '🚗', '🚜', '🚦', '🚧', '🚨', '🚫', '🚲', '🛍️', '🛑', '🛟', '🛠', '🛡', '🛥', '🛰', '🛳', '🛴', '🛶', '🛷', '🛸', '🛹', '🛻', '🛼', '🤖', '🤿', '🥁', '🥊', '��', '🥏', '🥐', '🥑', '🥕', '🥚', '🥝', '🥥', '🥧', '🥨', '🥭', '🥯', '🦀', '🦁', '🦂', '🦄', '🦅', '🦆', '🦇', '🦈', '🦉', '🦊', '🦋', '🦌', '🦍', '🦎', '🦏', '🦒', '🦓', '🦔', '🦕', '🦘', '🦙', '🦚', '🦛', '🦜', '🦝', '🦠', '🦣', '🦥', '🦦', '🦨', '🦩', '🦫', '🦬', '🧀', '🧁', '🧡', '🧨', '🧩', '��', '🧬', '🧭', '🧯', '🧲', '🧸', '🩵', '🩷', '🪀', '🪁', '🪂', '🪄', '🪅', '🪇', '🪈', '🪐', '🪓', '🪗', '🪘', '🪚', '🪦', '🪩', '🪱', '🪴', '🪵', '🪸', '🪼', '🪽', '🪿', '🫏', '🫐', '🫑'
  ];

  -- Emoji length
  _emoji_length CONSTANT INTEGER := ARRAY_LENGTH(_emojis, 1);
BEGIN
  RETURN _emojis[FLOOR(utilities.safe_random() * _emoji_length) + 1];
END;
$$;

-- Validate a media object name
CREATE OR REPLACE FUNCTION utilities.validate_media_object_name(
  _object_name TEXT,
  _user_id UUID
)
RETURNS BOOLEAN
STABLE
LANGUAGE plpgsql
AS $$
DECLARE
  -- Parsed name segments
  _segments TEXT[];
BEGIN
  -- Parse the name
  _segments = STRING_TO_ARRAY(_object_name, '/');

  -- Return false if the name has an incorrect number of segments
  IF ARRAY_LENGTH(_segments, 1) != 3 THEN
    RETURN FALSE;
  END IF;

  -- Posts category
  IF _segments[2] = 'posts' THEN
    -- Check that the user owns the corresponding post
    RETURN EXISTS(
      SELECT 1
      FROM public.posts
      WHERE
        poster_id = _user_id
        AND id = _segments[3]::UUID
    );

  -- Unknown media category
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- Get the latest location for a user
CREATE OR REPLACE FUNCTION utilities.get_latest_location(
  _user_id UUID
)
RETURNS GEOGRAPHY(POINT, 4326)
SECURITY DEFINER
VOLATILE
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (
    SELECT location
    FROM public.locations
    WHERE user_id = _user_id
    ORDER BY created_at DESC
    LIMIT 1
  );
END;
$$;

-- Setup a profile for a new user trigger function
CREATE OR REPLACE FUNCTION utilities.setup_profile_trigger()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert a new profile for the user
  INSERT INTO public.profiles (
    id
  ) VALUES (
    NEW.id
  );

  RETURN NEW;
END;
$$;

-- Validate a new location trigger function
CREATE OR REPLACE FUNCTION utilities.validate_location_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  -- Previous created at
  _previous_created_at TIMESTAMPTZ;

  -- Previous location
  _previous_location GEOGRAPHY(POINT, 4326);

  -- The _elapsed time (in seconds) between the new location and the previous location
  _elapsed BIGINT;

  -- The _distance (in meters) between the new location and the previous location
  _distance DOUBLE PRECISION;
BEGIN
  -- Get the previous created at and location
  SELECT created_at, location INTO _previous_created_at, _previous_location
  FROM public.locations
  WHERE user_id = NEW.user_id
  ORDER BY created_at DESC
  LIMIT 1;

  -- Return if there is no previous created at/location
  IF _previous_created_at IS NULL AND _previous_location IS NULL THEN
    RETURN NEW;
  END IF;

  -- Calculate the _elapsed time between the new location and the previous location
  SELECT EXTRACT(EPOCH FROM (NEW.created_at - _previous_created_at)) INTO _elapsed;

  -- Calculate the distance between the new location and the previous location
  SELECT ST_Distance(NEW.location, _previous_location) INTO _distance;

  -- Prevent the user from moving too fast (> 1200 km/h ~= 333.333 m/s)
  IF (_distance / _elapsed::DOUBLE PRECISION) > 333.333 THEN
    RAISE EXCEPTION 'Velocity is too high!';
  END IF;

  RETURN NEW;
END;
$$;

-- Prune old locations trigger function
CREATE OR REPLACE FUNCTION utilities.prune_locations()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Keep only 5 newest locations for the user
  DELETE FROM public.locations
  WHERE
    user_id = NEW.user_id AND
    id NOT IN (
      SELECT id
      FROM public.locations
      ORDER BY created_at DESC
      LIMIT 5
    );

  RETURN NEW;
END;
$$;

-- Delete downvoted posts trigger function
CREATE OR REPLACE FUNCTION public.delete_downvoted_posts()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  -- Post ID
  _post_id BIGINT;

  -- Net votes
  _net_votes INTEGER;
BEGIN
  -- Get the post ID
  _post_id = NEW.post_id;
  IF _post_id IS NULL THEN
    _post_id = OLD.post_id;
  END IF;

  -- Calculate net votes
  SELECT SUM(CASE WHEN upvote = TRUE THEN 1 ELSE -1 END) INTO _net_votes
  FROM public.post_votes
  WHERE post_id = _post_id;

  -- Delete the post if the net votes is less than or equal to -5
  IF _net_votes <= -5 THEN
    DELETE FROM public.posts
    WHERE id = _post_id;
  END IF;

  RETURN NULL;
END;
$$;

-- Delete downvoted comments trigger function
CREATE OR REPLACE FUNCTION public.delete_downvoted_comments()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  -- Comment ID
  _comment_id BIGINT;

  -- Net votes
  _net_votes INTEGER;
BEGIN
  -- Get the comment ID
  _comment_id = NEW.comment_id;
  IF _comment_id IS NULL THEN
    _comment_id = OLD.comment_id;
  END IF;

  -- Calculate net votes
  SELECT SUM(CASE WHEN upvote = TRUE THEN 1 ELSE -1 END) INTO _net_votes
  FROM public.comment_votes
  WHERE comment_id = _comment_id;

  -- Delete the comment if the net votes is less than or equal to -5
  IF _net_votes <= -5 THEN
    DELETE FROM public.comments
    WHERE id = _comment_id;
  END IF;

  RETURN NULL;
END;
$$;

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

  -- Poster user ID (Foreign key to auth.users)
  poster_id UUID NOT NULL REFERENCES auth.users ON UPDATE CASCADE ON DELETE CASCADE DEFAULT auth.uid(),

  -- Post filter location (EPSG4326 - used by the W3C geolocation API)
  location GEOGRAPHY(POINT, 4326) NOT NULL DEFAULT utilities.get_latest_location(auth.uid()),

  -- Creation timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() CHECK (created_at <= NOW()),

  -- Filter radius in meters (Clamped between 500 meters and 50 kilometers)
  radius DOUBLE PRECISION NOT NULL CHECK (500 < radius AND radius < 50000),

  -- Plain-text content (Maximum length of 300 characters)
  content VARCHAR(300) NOT NULL,

  -- Whether or not the post has media (e.g.: an image or video)
  has_media BOOLEAN NOT NULL DEFAULT FALSE
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

  -- Commenter user ID (Foreign key to auth.users)
  commenter_id UUID NOT NULL REFERENCES auth.users ON UPDATE CASCADE ON DELETE CASCADE DEFAULT auth.uid(),

  -- Parent post ID (Foreign key to public.posts)
  post_id UUID NOT NULL REFERENCES public.posts ON UPDATE CASCADE ON DELETE CASCADE,

  -- Parent comment ID (Foreign key to public.comments)
  comment_id UUID NULL REFERENCES public.comments ON UPDATE CASCADE ON DELETE CASCADE,

  -- Creation timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() CHECK (created_at <= NOW()),

  -- Comment content (Maximum length of 1000 characters)
  content VARCHAR(1000) NOT NULL
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

/* --------------------------------------- Setup buckets --------------------------------------- */

-- Media
INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
) VALUES (
  'media',
  'media',
  TRUE,
  4194304, -- 4 MiB
  ARRAY[
    -- Images
    'image/avif',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/svg+xml',
    'image/webp',

    -- Videos
    'video/mp4',
    'video/mpeg',
    'video/webm'
  ]
);

/* --------------------------------------- Setup indexes --------------------------------------- */

-- User locations location index
CREATE INDEX locations_location ON public.locations USING GIST (location);

-- Posts location index
CREATE INDEX posts_location ON public.posts USING GIST (location);

-- Posts created at index
CREATE INDEX posts_created_at ON public.posts (created_at);

-- Comments created at index
CREATE INDEX comments_created_at ON public.comments (created_at);

/* --------------------------------------- Setup triggers -------------------------------------- */

-- Create a profile for a new user
CREATE TRIGGER create_profile_after_insert
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION utilities.setup_profile_trigger();

-- Validate new locations
CREATE TRIGGER validate_location_before_insert
BEFORE INSERT ON public.locations
FOR EACH ROW
EXECUTE FUNCTION utilities.validate_location_trigger();

-- Prune old locations
CREATE TRIGGER prune_locations_after_insert
AFTER INSERT ON public.locations
FOR EACH ROW
EXECUTE FUNCTION utilities.prune_locations();

-- Delete downvoted posts
CREATE TRIGGER delete_downvoted_posts_after_insert
AFTER INSERT ON public.post_votes
FOR EACH ROW
EXECUTE FUNCTION public.delete_downvoted_posts();

CREATE TRIGGER delete_downvoted_posts_after_update
AFTER UPDATE ON public.post_votes
FOR EACH ROW
EXECUTE FUNCTION public.delete_downvoted_posts();

CREATE TRIGGER delete_downvoted_posts_after_delete
AFTER DELETE ON public.post_votes
FOR EACH ROW
EXECUTE FUNCTION public.delete_downvoted_posts();

-- Delete downvoted comments
CREATE TRIGGER delete_downvoted_comments_after_insert
AFTER INSERT ON public.comment_votes
FOR EACH ROW
EXECUTE FUNCTION public.delete_downvoted_comments();

CREATE TRIGGER delete_downvoted_comments_after_update
AFTER UPDATE ON public.comment_votes
FOR EACH ROW
EXECUTE FUNCTION public.delete_downvoted_comments();

CREATE TRIGGER delete_downvoted_comments_after_delete
AFTER DELETE ON public.comment_votes
FOR EACH ROW
EXECUTE FUNCTION public.delete_downvoted_comments();

/* ------------------------- Setup column-level security (CLS) policies ------------------------ */

-- Profiles
GRANT SELECT ON public.profiles TO authenticated;

-- User locations
GRANT SELECT, DELETE ON public.locations TO authenticated;
GRANT INSERT (
  location
)
ON public.locations
TO authenticated;

-- Posts
GRANT SELECT (
  id,
  poster_id,
  created_at,
  radius,
  content,
  has_media
) ON public.posts TO authenticated;
GRANT DELETE ON public.posts TO authenticated;
GRANT INSERT (
  radius,
  content,
  has_media
)
ON public.posts
TO authenticated;

-- Post votes
GRANT SELECT, DELETE ON public.post_votes TO authenticated;
GRANT INSERT, UPDATE (
  post_id,
  upvote
)
ON public.post_votes TO authenticated;

-- Post reports
GRANT SELECT, DELETE ON public.post_reports TO authenticated;
GRANT INSERT (
  post_id
)
ON public.post_reports TO authenticated;

-- Comments
GRANT SELECT, DELETE ON public.comments TO authenticated;
GRANT INSERT (
  post_id,
  comment_id,
  content
)
ON public.comments TO authenticated;

-- Comment votes
GRANT SELECT, DELETE ON public.comment_votes TO authenticated;
GRANT INSERT, UPDATE (
  comment_id,
  upvote
)
ON public.comment_votes TO authenticated;

-- Comment reports
GRANT SELECT, DELETE ON public.comment_reports TO authenticated;
GRANT INSERT (
  comment_id
)
ON public.comment_reports TO authenticated;

/* ----------------------------- Row-level security (RLS) policies ----------------------------- */

-- Enable row-level security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY select_profiles
ON public.profiles
FOR SELECT
TO authenticated;

-- User locations
CREATE POLICY select_locations
ON public.locations
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY insert_locations
ON public.locations
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY delete_locations
ON public.locations
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Posts
CREATE POLICY select_posts
ON public.posts
FOR SELECT
TO authenticated
USING (
  -- Only show posts for which the user is the poster
  poster_id = auth.uid()

  -- Or only show posts for which the user is within the post's radius
  OR ST_Distance(location, utilities.get_latest_location(auth.uid())) <= radius
);

CREATE POLICY insert_posts
ON public.posts
FOR INSERT
TO authenticated
WITH CHECK (poster_id = auth.uid());

CREATE POLICY delete_posts
ON public.posts
FOR DELETE
TO authenticated
USING (poster_id = auth.uid());

-- Post votes
CREATE POLICY select_post_votes
ON public.post_votes
FOR SELECT
TO authenticated
USING (voter_id = auth.uid());

CREATE POLICY insert_post_votes
ON public.post_votes
FOR INSERT
TO authenticated
WITH CHECK (voter_id = auth.uid());

CREATE POLICY update_post_votes
ON public.post_votes
FOR UPDATE
TO authenticated
USING (voter_id = auth.uid());

CREATE POLICY delete_post_votes
ON public.post_votes
FOR DELETE
TO authenticated
USING (voter_id = auth.uid());

-- Post reports
CREATE POLICY select_post_reports
ON public.post_reports
FOR SELECT
TO authenticated
USING (reporter_id = auth.uid());

CREATE POLICY insert_post_reports
ON public.post_reports
FOR INSERT
TO authenticated
WITH CHECK (reporter_id = auth.uid());

CREATE POLICY delete_post_reports
ON public.post_reports
FOR DELETE
TO authenticated
USING (reporter_id = auth.uid());

-- Comments
CREATE POLICY select_comments
ON public.comments
FOR SELECT
TO authenticated
USING (commenter_id = auth.uid());

CREATE POLICY insert_comments
ON public.comments
FOR INSERT
TO authenticated
WITH CHECK (commenter_id = auth.uid());

CREATE POLICY delete_comments
ON public.comments
FOR DELETE
TO authenticated
USING (commenter_id = auth.uid());

-- Comment votes
CREATE POLICY select_comment_votes
ON public.comment_votes
FOR SELECT
TO authenticated
USING (voter_id = auth.uid());

CREATE POLICY insert_comment_votes
ON public.comment_votes
FOR INSERT
TO authenticated
WITH CHECK (voter_id = auth.uid());

CREATE POLICY update_comment_votes
ON public.comment_votes
FOR UPDATE
TO authenticated
USING (voter_id = auth.uid());

CREATE POLICY delete_comment_votes
ON public.comment_votes
FOR DELETE
TO authenticated
USING (voter_id = auth.uid());

-- Comment reports
CREATE POLICY select_comment_reports
ON public.comment_reports
FOR SELECT
TO authenticated
USING (reporter_id = auth.uid());

CREATE POLICY insert_comment_reports
ON public.comment_reports
FOR INSERT
TO authenticated
WITH CHECK (reporter_id = auth.uid());

CREATE POLICY delete_comment_reports
ON public.comment_reports
FOR DELETE
TO authenticated
USING (reporter_id = auth.uid());

-- Media
CREATE POLICY select_media_objects
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'media');

CREATE POLICY insert_media_objects
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  -- Media bucket
  bucket_id = 'media'

  -- Valiate the object name
  AND utilities.validate_media_object_name(name, auth.uid())
);

CREATE POLICY delete_media_objects
ON storage.objects
FOR DELETE
TO authenticated
USING (
  -- Media bucket
  bucket_id = 'media'

  -- Valiate the object name
  AND utilities.validate_media_object_name(name, auth.uid())
);
