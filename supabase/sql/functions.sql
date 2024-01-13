/**
 * Setup functions
 *
 * Prerequisites: before.sql
 */

/* --------------------------------- Private utility functions --------------------------------- */

-- Generate a random double precision number between 0 (inclusive) and 1 (exclusive), using crypto-safe random data
--
-- This function has been verified to produce a uniform distribution of values using a one-sample Kolmogorov-Smirnov
-- test with a null hypothesis of perfect uniform distribution with a p value of exactly 0.0 (Less round-off errors)
-- for a sample size of 1 million. See safe_random_analysis.py for more information.
--
-- Note that because this function uses rejection-sampling, timing attacks are hypothetically possible, especially
-- if the RNG is predictable (Though that in itself represents a rather grave security concern).
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

    -- Return if the value is not 1 (The probability of this happening is very close to 0, but this guarentees the returned value is never 1)
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
    '⌚️', '⏰', '⏳', '☀️', '☁️', '☢️', '☣️', '♻️', '⚓️', '⚛️', '⚠️', '⚡️', '⚽️', '⚾️', '⛄️', '⛏', '⛔️', '⛩', '⛰', '⛱', '⛳️', '⛵️', '⛸', '✂️', '✅', '✈️', '❄️', '❌', '❎', '❓', '❗️', '❤️', '⭐️', '⭕️', '🌈', '🌊', '🌋', '🌎', '🌐', '🌑', '🌕', '🌗', '🌡', '🌪', '🌱', '🌲', '🌳', '🌴', '🌵', '🌶', '🌷', '🌻', '🌽', '🍀', '🍁', '🍂', '🍄', '🍅', '🍆', '🍇', '🍉', '🍊', '🍋', '🍌', '🍍', '🍎', '🍐', '🍑', '🍒', '🍓', '🍥', '🍦', '🍩', '🍪', '🍫', '🍬', '🍭', '🍰', '🍷', '🍸', '🍺', '🍿', '🎀', '🎁', '🎃', '🎈', '🎉', '🎗', '🎟', '🎡', '🎢', '🎤', '🎥', '🎧', '🎨', '🎩', '🎪', '🎬', '🎭', '🎮', '🎯', '🎰', '🎱', '🎲', '🎳', '🎵', '🎷', '🎸', '🎹', '🎺', '🎻', '🏀', '🏅', '🏆', '🏈', '🏉', '🏍', '🏐', '🏓', '🏕', '🏗', '🏝', '🏟', '🏠', '🏢', '🏭', '🏮', '🏯', '🏰', '🏹', '🐁', '🐅', '🐇', '🐊', '🐌', '🐍', '🐏', '🐐', '🐑', '🐓', '🐔', '🐗', '🐘', '🐙', '🐚', '🐛', '🐜', '🐝', '🐞', '🐟', '🐡', '🐢', '🐤', '🐦', '🐦‍⬛', '🐧', '🐨', '🐫', '🐬', '🐭', '🐮', '🐯', '🐰', '🐱', '🐳', '🐴', '🐵', '🐶', '🐷', '🐸', '🐹', '🐺', '🐻', '🐻‍❄️', '🐼', '🐿', '👑', '👽', '💀', '💈', '💎', '💙', '💚', '💜', '💡', '💢', '💣', '💥', '💧', '💯', '💰', '💵', '💸', '📈', '📉', '📌', '📎', '📜', '📡', '📣', '📦', '📫', '📸', '🔆', '🔊', '🔍', '🔑', '🔒', '🔔', '🔗', '🔥', '🔦', '🔩', '🔪', '🔫', '🔬', '🔭', '🔮', '🔱', '🕷', '🕹', '🖊', '🖌', '🖍', '🖤', '🗡', '🗺', '🗻', '🗼', '🗽', '🗿', '🚀', '🚂', '🚌', '🚑', '🚒', '🚓', '🚕', '🚗', '🚜', '🚦', '🚧', '🚨', '🚫', '🚲', '🛍️', '🛑', '🛟', '🛠', '🛡', '🛥', '🛰', '🛳', '🛴', '🛶', '🛷', '🛸', '🛹', '🛻', '🛼', '🤖', '🤿', '🥁', '🥊', '🥏', '🥐', '🥑', '🥕', '🥚', '🥝', '🥥', '🥧', '🥨', '🥭', '🥯', '🦀', '🦁', '🦂', '🦄', '🦅', '🦆', '🦇', '🦈', '🦉', '🦊', '🦋', '🦌', '🦍', '🦎', '🦏', '🦒', '🦓', '🦔', '🦕', '🦘', '🦙', '🦚', '🦛', '🦜', '🦝', '🦠', '🦣', '🦥', '🦦', '🦨', '🦩', '🦫', '🦬', '🧀', '🧁', '🧡', '🧨', '🧩', '🧬', '🧭', '🧯', '🧲', '🧸', '🩵', '🩷', '🪀', '🪁', '🪂', '🪄', '🪅', '🪇', '🪈', '🪐', '🪓', '🪗', '🪘', '🪚', '🪦', '🪩', '🪱', '🪴', '🪵', '🪸', '🪼', '🪽', '🪿', '🫏', '🫐', '🫑'
  ];

  -- Emoji length
  _emoji_length CONSTANT INTEGER := ARRAY_LENGTH(_emojis, 1);
BEGIN
  RETURN _emojis[FLOOR(utilities.safe_random() * _emoji_length) + 1];
END;
$$;

-- Register the webauthn credential after a challenge has been successfully verified
CREATE OR REPLACE FUNCTION utilities.register_webauthn_credential(
  -- User ID
  _user_id UUID,

  -- Challenge ID
  _challenge_id UUID,

  -- Client-side credential ID
  _client_credential_id TEXT,

  -- Credential counter
  _counter BIGINT,

  -- Credential public key
  _public_key VARCHAR(1000)
)
RETURNS VOID
SECURITY DEFINER
VOLATILE
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert the credential
  INSERT INTO auth.webauthn_credentials (
    user_id,
    client_credential_id,
    counter,
    public_key
  ) VALUES (
    _user_id,
    _client_credential_id,
    _counter,
    _public_key
  );

  -- Delete the challenge
  DELETE FROM auth.webauthn_challenges
  WHERE id = _challenge_id;
END;
$$;

-- Update the webauthn credential after a challenge has been successfully verified
CREATE OR REPLACE FUNCTION utilities.authenticate_webauthn_credential(
  -- User ID
  _user_id UUID,

  -- Challenge ID
  _challenge_id UUID,

  -- Credential ID
  _credential_id UUID,

  -- New credential counter
  _new_counter BIGINT
)
RETURNS VOID
SECURITY DEFINER
VOLATILE
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update the credential
  UPDATE auth.webauthn_credentials SET counter = _new_counter WHERE id = _credential_id AND user_id = _user_id;

  -- Delete the challenge
  DELETE FROM auth.webauthn_challenges
  WHERE id = _challenge_id;
END;
$$;

-- Prune old webauthn challenges
CREATE OR REPLACE FUNCTION utilities.prune_webauthn_challenges()
RETURNS VOID
SECURITY DEFINER
VOLATILE
LANGUAGE plpgsql
AS $$
DECLARE
  -- Expiration interval
  _interval CONSTANT INTERVAL := INTERVAL '1 hour';
BEGIN
  -- Delete expired challenges
  DELETE FROM auth.webauthn_challenges
  WHERE created_at < (NOW() - _interval);
END;
$$;

-- Validate a media object name
CREATE OR REPLACE FUNCTION utilities.validate_media_object_name(
  _object_name TEXT,
  _user_id UUID
)
RETURNS BOOLEAN
SECURITY DEFINER
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
  IF ARRAY_LENGTH(_segments, 1) != 2 THEN
    RETURN FALSE;
  END IF;

  -- Posts category
  IF _segments[1] = 'posts' THEN
    -- Check that the user owns the corresponding post and that the post should have media
    RETURN EXISTS(
      SELECT 1
      FROM public.posts
      WHERE
        private_poster_id = _user_id
        AND has_media = TRUE
        AND id = _segments[2]::UUID
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
    RAISE EXCEPTION 'You do not have a location set';
  END IF;

  -- Previous location too old
  IF _created_at < (NOW() - INTERVAL '1 hour') THEN
    RAISE EXCEPTION 'Your location is too old';
  END IF;

  RETURN _location;
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

/* ------------------------------------- Trigger functions ------------------------------------- */

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
SECURITY DEFINER
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

  -- Skip inserting if the elapsed time is zero
  IF _elapsed = 0::BIGINT THEN
    RETURN NULL;
  END IF;

  -- Calculate the distance between the new location and the previous location
  SELECT extensions.ST_Distance(NEW.location, _previous_location) INTO _distance;

  -- Prevent the user from moving too fast (> 1200 km/h ~= 333.333 m/s)
  IF (_distance / _elapsed::DOUBLE PRECISION) > 333.333 THEN
    RAISE EXCEPTION 'You are moving too fast';
  END IF;

  RETURN NEW;
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
  _uncertainty DOUBLE PRECISION := 0.10;

  -- Old location as a geometry point
  _old_location GEOMETRY;
BEGIN
  -- Convert the old location to a geometry point
  _old_location = NEW.private_location::GEOMETRY;

  -- Add some uncertainty relative to the post's radius (To increase resistance against static trilateration attacks)
  NEW.private_location = extensions.ST_Project(
    _old_location::GEOGRAPHY,
    (-(_uncertainty / 2) * NEW.radius) + (_uncertainty * NEW.radius * utilities.safe_random()),
    2 * PI() * utilities.safe_random()
  );

  RETURN NEW;
END;
$$;
-- Post deleted trigger function
CREATE OR REPLACE FUNCTION utilities.post_deleted_trigger()
RETURNS TRIGGER
SECURITY DEFINER
VOLATILE
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete the media
  IF OLD.has_media THEN
    DELETE FROM storage.objects
    WHERE bucket_id = 'media'
    AND name = 'posts/' || OLD.id::TEXT;
  END IF;

  RETURN NULL;
END;
$$;

-- Post view modified (i.e.: insert, update, or delete) trigger function
CREATE OR REPLACE FUNCTION utilities.post_view_modified_trigger()
RETURNS TRIGGER
SECURITY DEFINER
VOLATILE
LANGUAGE plpgsql
AS $$
DECLARE
  -- Post ID
  _post_id UUID := CASE WHEN NEW IS NULL THEN OLD.post_id ELSE NEW.post_id END;
BEGIN
  -- Recalculate post views
  UPDATE public.posts
  SET views = (
    SELECT COUNT(*)
    FROM public.post_views
    WHERE post_id = _post_id
  )
  WHERE id = _post_id;

  RETURN NULL;
END;
$$;

-- Post vote modified (i.e.: insert, update, or delete) trigger function
CREATE OR REPLACE FUNCTION utilities.post_vote_modified_trigger()
RETURNS TRIGGER
SECURITY DEFINER
VOLATILE
LANGUAGE plpgsql
AS $$
DECLARE
  -- Post ID
  _post_id UUID := CASE WHEN NEW IS NULL THEN OLD.post_id ELSE NEW.post_id END;

  -- Post upvotes
  _upvotes BIGINT;

  -- Post downvotes
  _downvotes BIGINT;
BEGIN
  -- Recalculate post votes
  SELECT
    COALESCE(SUM(CASE WHEN upvote THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN NOT upvote THEN 1 ELSE 0 END), 0)
    INTO _upvotes, _downvotes
  FROM public.post_votes
  WHERE post_id = _post_id;

  -- Update the post
  UPDATE public.posts
  SET
    upvotes = _upvotes,
    downvotes = _downvotes
  WHERE id = _post_id;

  -- Delete the post if the net votes is less than or equal to -5
  IF (_upvotes - _downvotes) <= -5 THEN
    DELETE FROM public.posts
    WHERE id = _post_id;
  END IF;

  RETURN NULL;
END;
$$;

-- Comment modified (i.e.: insert, update, or delete) trigger function
CREATE OR REPLACE FUNCTION utilities.comment_modified_trigger()
RETURNS TRIGGER
SECURITY DEFINER
VOLATILE
LANGUAGE plpgsql
AS $$
DECLARE
  -- Comment ID
  _id UUID := CASE WHEN NEW IS NULL THEN OLD.id ELSE NEW.id END;

  -- Comment post ID
  _post_id UUID := CASE WHEN NEW IS NULL THEN OLD.post_id ELSE NEW.post_id END;

  -- Current ancestor comment ID
  _ancestor_id UUID := CASE WHEN NEW IS NULL THEN OLD.parent_id ELSE NEW.parent_id END;

  -- Ancestor comment IDs
  _ancestor_ids UUID[];
BEGIN
  -- Recalculate post comments
  UPDATE public.posts
  SET comments = (
    SELECT COUNT(*)
    FROM public.comments
    WHERE post_id = _post_id
  )
  WHERE id = _post_id;

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
      RAISE EXCEPTION 'The ancestor''s comment''s post does not match the child comment''s post';
    END IF;

    -- Check for repeated comments
    IF _ancestor_id = ANY(_ancestor_ids) THEN
      RAISE EXCEPTION 'The ancestor comment is repeated';
    END IF;

    -- Add the parent ID to the ancestor IDs
    _ancestor_ids = array_append(_ancestor_ids, _ancestor_id);

    -- Get the next parent ID
    SELECT parent_id INTO _ancestor_id
    FROM public.comments
    WHERE id = _ancestor_id;
  END LOOP;

  -- Comment depth too deep
  RAISE EXCEPTION 'This comment is too many levels deep';
END;
$$;

-- Comment view modified (i.e.: insert, update, or delete) trigger function
CREATE OR REPLACE FUNCTION utilities.comment_view_modified_trigger()
RETURNS TRIGGER
SECURITY DEFINER
VOLATILE
LANGUAGE plpgsql
AS $$
DECLARE
  -- Comment ID
  _comment_id UUID := CASE WHEN NEW IS NULL THEN OLD.comment_id ELSE NEW.comment_id END;
BEGIN
  -- Recalculate comment views
  UPDATE public.comments
  SET views = (
    SELECT COUNT(*)
    FROM public.comment_views
    WHERE comment_id = _comment_id
  )
  WHERE id = _comment_id;

  RETURN NULL;
END;
$$;

-- Comment vote modified (i.e.: insert, update, or delete) trigger function
CREATE OR REPLACE FUNCTION utilities.comment_vote_modified_trigger()
RETURNS TRIGGER
SECURITY DEFINER
VOLATILE
LANGUAGE plpgsql
AS $$
DECLARE
  -- Comment ID
  _comment_id UUID := CASE WHEN NEW IS NULL THEN OLD.comment_id ELSE NEW.comment_id END;

  -- Comment upvotes
  _upvotes BIGINT;

  -- Comment downvotes
  _downvotes BIGINT;
BEGIN
  -- Recalculate comment votes
  SELECT
    COALESCE(SUM(CASE WHEN upvote THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN NOT upvote THEN 1 ELSE 0 END), 0)
    INTO _upvotes, _downvotes
  FROM public.comment_votes
  WHERE comment_id = _comment_id;

  -- Update the comment
  UPDATE public.comments
  SET
    upvotes = _upvotes,
    downvotes = _downvotes
  WHERE id = _comment_id;

  -- Delete the comment if the net votes is less than or equal to -5
  IF (_upvotes - _downvotes) <= -5 THEN
    DELETE FROM public.comments
    WHERE id = _comment_id;
  END IF;

  RETURN NULL;
END;
$$;

/* -------------------------------------- Public functions ------------------------------------- */

-- Delete all webauthn credentials for the current user
CREATE OR REPLACE FUNCTION public.delete_webauthn_credentials()
RETURNS VOID
SECURITY DEFINER
VOLATILE
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete all webauthn credentials for the current user
  DELETE FROM auth.webauthn_credentials
  WHERE user_id = auth.uid();
END;
$$;

-- Calculate the distance from the current user's location to a specified location
CREATE OR REPLACE FUNCTION public.distance_to(
  -- Other location to calculate the distance to
  _other_location GEOGRAPHY(POINT, 4326)
)
RETURNS DOUBLE PRECISION
SECURITY DEFINER
VOLATILE
LANGUAGE plpgsql
AS $$
DECLARE
  -- Current user's location
  _user_location GEOGRAPHY(POINT, 4326) := utilities.get_latest_location(auth.uid());
BEGIN
  RETURN extensions.ST_Distance(_user_location, _other_location);
END;
$$;

-- Calculate the rank of a post
CREATE OR REPLACE FUNCTION public.calculate_rank(
  -- Distance to the post (In meters)
  _distance DOUBLE PRECISION,

  -- Post score (Upvotes - downvotes)
  _score BIGINT,

  -- Post created at
  _created_at TIMESTAMPTZ
)
RETURNS BIGINT
IMMUTABLE
LANGUAGE plpgsql
AS $$
DECLARE
  -- Ranking scale factor
  _scale DOUBLE PRECISION := 10000;

  -- Distance weight factor
  _distance_weight DOUBLE PRECISION := 5;

  -- Maximum distance to be considered (In meters)
  _distance_range DOUBLE PRECISION := 5000;

  -- Minimum score threshold
  _score_threshold BIGINT := -5;

  -- Age weight factor
  _age_weight DOUBLE PRECISION := 1.075;
BEGIN
  RETURN FLOOR(
    _scale *
    ((_distance_weight - 1) * POWER(LEAST(1, _distance / _distance_range) - 1, 2) + 1) *
    LOG(GREATEST(1, _score - _score_threshold + 1)) *
    POWER(_age_weight, -EXTRACT(EPOCH FROM (NOW() - _created_at)) / 3600)
  )::BIGINT;
END;
$$;
