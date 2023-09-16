/**
 * Setup tables
 * Dependencies: types.sql
 */

-- Profiles (Modifying auth.users is considered bad practice, so additonal user data is stored here)
CREATE TABLE public.profiles (
  -- Primary key (Foreign key to auth.users)
  id UUID NOT NULL REFERENCES auth.users ON UPDATE CASCADE ON DELETE CASCADE,

  -- Accumulated profile karma
  karma INTEGER NOT NULL DEFAULT 0,

  -- TODO: don't expose this
  -- Last 5 geotimestamps of the user (To detect location spoofing)
  -- geotimestamps public.geotimestamp[] NOT NULL DEFAULT '{}' CHECK (ARRAY_LENGTH(geotimestamps, 1) <= 5)
);

-- Posts
CREATE TABLE public.posts (
  -- Primary key
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Poster user ID (Foreign key to auth.users)
  poster UUID NOT NULL REFERENCES auth.users ON UPDATE CASCADE ON DELETE CASCADE,

  -- Geotimestamp of the post
  geotimestamp public.geotimestamp NOT NULL,

  -- Post radius in meters (Default: 5 miles)
  radius DOUBLE PRECISION NOT NULL DEFAULT 8046 CHECK (radius > 0),

  -- Post title (Maximum length of 100 characters)
  title VARCHAR(100) NOT NULL,

  -- Post content (Maximum length of 1000 characters)
  content VARCHAR(1000) NOT NULL,

  -- Post upvotes
  upvotes INTEGER NOT NULL DEFAULT 0 CHECK (upvotes >= 0),

  -- Post downvotes
  downvotes INTEGER NOT NULL DEFAULT 0 CHECK (downvotes >= 0)
);

-- Comments (Nestable)
CREATE TABLE public.comments (
  -- Primary key
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Parent post ID (Foreign key to public.posts)
  post UUID NOT NULL REFERENCES public.posts ON UPDATE CASCADE ON DELETE CASCADE,

  -- Parent comment ID (Foreign key to public.comments)
  comment UUID NULL REFERENCES public.comments ON UPDATE CASCADE ON DELETE CASCADE,

  -- Commenter user ID (Foreign key to auth.users)
  commenter UUID NOT NULL REFERENCES auth.users ON UPDATE CASCADE ON DELETE CASCADE,

  -- Comment content (Maximum length of 1000 characters)
  content VARCHAR(1000) NOT NULL,

  -- Comment upvotes
  upvotes INTEGER NOT NULL DEFAULT 0 CHECK (upvotes >= 0),

  -- Comment downvotes
  downvotes INTEGER NOT NULL DEFAULT 0 CHECK (downvotes >= 0)
);
