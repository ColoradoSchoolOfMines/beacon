/**
 * Setup functions
 *
 * Prerequisites: before.sql
 */

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

-- Calculate the distance between two locations, with an uncertainty factor to anonymize the locations
CREATE OR REPLACE FUNCTION utilities.anonymized_distance(
  -- First location
  _a GEOGRAPHY(POINT, 4326),

  -- Second location
  _b GEOGRAPHY(POINT, 4326),

  -- Distance uncertainty (in meters)
  _uncertainty DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION
VOLATILE
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN extensions.ST_Distance(_a, _b) - (0.5 * _uncertainty) + (_uncertainty * utilities.safe_random());
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
    -- Check that the user owns the corresponding post and that the post should have media
    RETURN EXISTS(
      SELECT 1
      FROM public.posts
      WHERE
        private_poster_id = _user_id
        AND has_media = TRUE
        AND id = _segments[3]::UUID
    );

  -- Unknown media category
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- Get the latest location for a user, raising an exception if there's no previous location or if the previous location is too old
CREATE OR REPLACE FUNCTION utilities.get_latest_location(
  -- User ID for which to get the latest location
  _user_id UUID
)
RETURNS GEOGRAPHY(POINT, 4326)
SECURITY DEFINER
VOLATILE
LANGUAGE plpgsql
AS $$
DECLARE
  -- Created at
  _created_at TIMESTAMPTZ;

  -- Location
  _location GEOGRAPHY(POINT, 4326);
BEGIN
  -- Get the latest location
  SELECT created_at, location INTO _created_at, _location
  FROM public.locations
  WHERE user_id = _user_id
  ORDER BY created_at DESC
  LIMIT 1;

  -- No previous location
  IF _created_at IS NULL AND _location IS NULL THEN
    RAISE EXCEPTION 'NO_PREVIOUS_LOCATION';
  END IF;

  -- Previous location too old
  IF _created_at < (NOW() - INTERVAL '1 hour') THEN
    RAISE EXCEPTION 'PREVIOUS_LOCATION_TOO_OLD';
  END IF;

  RETURN _location;
END;
$$;

-- Setup a profile for a new user trigger function
CREATE OR REPLACE FUNCTION utilities.setup_profile_trigger()
RETURNS TRIGGER
SECURITY DEFINER
VOLATILE
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
  SELECT extensions.ST_Distance(NEW.location, _previous_location) INTO _distance;

  -- Prevent the user from moving too fast (> 1200 km/h ~= 333.333 m/s)
  IF (_distance / _elapsed::DOUBLE PRECISION) > 333.333 THEN
    RAISE EXCEPTION 'VELOCITY_TOO_HIGH';
  END IF;

  RETURN NEW;
END;
$$;

-- Prune old locations trigger function
CREATE OR REPLACE FUNCTION utilities.prune_locations()
RETURNS TRIGGER
SECURITY DEFINER
VOLATILE
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

-- Get a post's votes
CREATE OR REPLACE FUNCTION utilities.get_post_votes(
  -- Post ID
  _id UUID,

  -- Whether or not the vote is an upvote
  _upvote BOOLEAN
)
RETURNS INTEGER
SECURITY DEFINER
VOLATILE
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.post_votes post_vote
    WHERE post_vote.post_id = _id AND post_vote.upvote = _upvote
  );
END;
$$;

-- Get a comment's votes
CREATE OR REPLACE FUNCTION utilities.get_comment_votes(
  -- Comment ID
  _id UUID,

  -- Whether or not the vote is an upvote
  _upvote BOOLEAN
)
RETURNS INTEGER
SECURITY DEFINER
VOLATILE
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.comment_votes comment_vote
    WHERE comment_vote.comment_id = _id AND comment_vote.upvote = _upvote
  );
END;
$$;

-- Anonymize the location of a new post trigger function
CREATE OR REPLACE FUNCTION utilities.anonymize_location_trigger()
RETURNS TRIGGER
SECURITY DEFINER
VOLATILE
LANGUAGE plpgsql
AS $$
DECLARE
  -- Old location as a geometry point
  _old_location GEOMETRY;
BEGIN
  -- Convert the old location to a geometry point
  _old_location = NEW.private_location::GEOMETRY;

  -- Add 5% location uncertainty relative to the post's radius (To increase resistance against static-target trilateration attacks)
  NEW.private_location = extensions.ST_MakePoint(
    extensions.ST_X(_old_location) - (0.025 * NEW.radius) + (0.05 * NEW.radius * utilities.safe_random()),
    extensions.ST_Y(_old_location) - (0.025 * NEW.radius) + (0.05 * NEW.radius * utilities.safe_random())
  );

  RETURN NEW;
END;
$$;

-- Post modified trigger function
CREATE OR REPLACE FUNCTION utilities.post_modified_trigger()
RETURNS TRIGGER
SECURITY DEFINER
VOLATILE
LANGUAGE plpgsql
AS $$
BEGIN
  -- Refresh the cached posts
  REFRESH MATERIALIZED VIEW utilities.cached_posts;

  RETURN NULL;
END;
$$;

-- Comment modified trigger function
CREATE OR REPLACE FUNCTION utilities.comment_modified_trigger()
RETURNS TRIGGER
SECURITY DEFINER
VOLATILE
LANGUAGE plpgsql
AS $$
DECLARE
  -- Comment ID
  _id UUID;

  -- Comment post ID
  _post_id UUID;

  -- Current ancestor comment ID
  _ancestor_id UUID;

  -- Ancestor comment IDs
  _ancestor_ids UUID[];
BEGIN
  -- Get information
  _id = CASE WHEN NEW IS NULL THEN OLD.id ELSE NEW.id END;
  _post_id = CASE WHEN NEW IS NULL THEN OLD.post_id ELSE NEW.post_id END;
  _ancestor_id = CASE WHEN NEW IS NULL THEN OLD.parent_id ELSE NEW.parent_id END;

  -- Refresh the cached comments
  REFRESH MATERIALIZED VIEW utilities.cached_comments;

  -- Add the comment ID to the ancestor IDs
  _ancestor_ids = array_append(_ancestor_ids, _id);

  -- Check for different posts, repeated comments, and calculate the depth
  FOR i IN 0..9 LOOP
    -- Reached the top-level comment
    IF _ancestor_id IS NULL THEN
      RETURN NEW;
    END IF;

    -- Ensure the ancestor comment's post matches the child comment's post
    IF (
      SELECT post_id
      FROM public.comments
      WHERE id = _ancestor_id
    ) != _post_id THEN
      RAISE EXCEPTION 'ANCESOR_COMMENT_DIFFERENT_POST';
    END IF;

    -- Check for repeated comments
    IF _ancestor_id = ANY(_ancestor_ids) THEN
      RAISE EXCEPTION 'ANCESTOR_COMMENT_REPEATED';
    END IF;

    -- Add the parent ID to the ancestor IDs
    _ancestor_ids = array_append(_ancestor_ids, _ancestor_id);

    -- Get the next parent ID
    SELECT parent_id INTO _ancestor_id
    FROM public.comments
    WHERE id = _ancestor_id;
  END LOOP;

  -- Comment depth too deep
  RAISE EXCEPTION 'COMMENT_DEPTH_TOO_DEEP';
END;
$$;

-- Post vote modified trigger function
CREATE OR REPLACE FUNCTION utilities.post_vote_modified_trigger()
RETURNS TRIGGER
SECURITY DEFINER
VOLATILE
LANGUAGE plpgsql
AS $$
DECLARE
  -- Post ID
  _post_id UUID;
BEGIN
  -- Get the post ID
  _post_id = CASE WHEN NEW IS NULL THEN OLD.post_id ELSE NEW.post_id END;

  -- Refresh the cached posts
  REFRESH MATERIALIZED VIEW utilities.cached_posts;

  -- Delete the post if the net votes is less than or equal to -5
  IF (
    SELECT upvotes - downvotes
    FROM public.posts
    WHERE id = _post_id
  ) <= -5 THEN
    DELETE FROM public.posts
    WHERE id = _post_id;
  END IF;

  RETURN NULL;
END;
$$;

-- Comment vote modified trigger function
CREATE OR REPLACE FUNCTION utilities.comment_vote_modified_trigger()
RETURNS TRIGGER
SECURITY DEFINER
VOLATILE
LANGUAGE plpgsql
AS $$
DECLARE
  -- Comment ID
  _comment_id UUID;
BEGIN
  -- Get the comment ID
  _comment_id = CASE WHEN NEW IS NULL THEN OLD.comment_id ELSE NEW.comment_id END;

  -- Refresh the cached comments
  REFRESH MATERIALIZED VIEW utilities.cached_comments;

  -- Delete the comment if the net votes is less than or equal to -5
  IF (
    SELECT upvotes - downvotes
    FROM public.comments
    WHERE id = _comment_id
  ) <= -5 THEN
    DELETE FROM public.comments
    WHERE id = _comment_id;
  END IF;

  RETURN NULL;
END;
$$;
