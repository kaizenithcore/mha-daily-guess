
-- Characters table
CREATE TABLE public.characters (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  aliases text[] NOT NULL DEFAULT '{}',
  gender text,
  age integer,
  height integer, -- cm
  quirk_type text, -- Emisor | Transformación | Mutante | Sin don
  affiliation text,
  nationality text,
  first_appearance_season integer,
  image_url text,
  silhouette_image_url text,
  quote text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX characters_name_idx ON public.characters (lower(name));
CREATE INDEX characters_active_idx ON public.characters (is_active);

ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active characters"
  ON public.characters FOR SELECT
  USING (is_active = true);

-- Daily characters table
CREATE TABLE public.daily_characters (
  date date NOT NULL PRIMARY KEY,
  character_id uuid NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read daily challenge"
  ON public.daily_characters FOR SELECT
  USING (true);
