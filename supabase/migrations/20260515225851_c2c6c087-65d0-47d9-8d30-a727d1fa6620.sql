
CREATE TYPE public.availability_status AS ENUM ('S', 'N', 'C');

CREATE TABLE public.availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_name TEXT NOT NULL,
  date DATE NOT NULL,
  status public.availability_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (member_name, date)
);

ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read availability"
  ON public.availability FOR SELECT
  USING (true);

CREATE POLICY "public insert availability"
  ON public.availability FOR INSERT
  WITH CHECK (true);

CREATE POLICY "public update availability"
  ON public.availability FOR UPDATE
  USING (true) WITH CHECK (true);

CREATE POLICY "public delete availability"
  ON public.availability FOR DELETE
  USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.availability;
