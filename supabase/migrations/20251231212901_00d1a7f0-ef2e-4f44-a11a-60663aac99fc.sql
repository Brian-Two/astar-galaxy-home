-- Create sources table for planet-attached content
CREATE TABLE public.sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  planet_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('link', 'file', 'text')),
  content TEXT,
  url TEXT,
  file_path TEXT,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;

-- Users can view sources for planets they have access to
CREATE POLICY "Users can view sources"
ON public.sources
FOR SELECT
USING (auth.uid() = user_id AND is_deleted = false);

-- Users can create sources
CREATE POLICY "Users can create sources"
ON public.sources
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own sources
CREATE POLICY "Users can update their own sources"
ON public.sources
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete (soft delete) their own sources
CREATE POLICY "Users can delete their own sources"
ON public.sources
FOR DELETE
USING (auth.uid() = user_id);

-- Add index for faster queries
CREATE INDEX idx_sources_planet_id ON public.sources(planet_id);
CREATE INDEX idx_sources_user_id ON public.sources(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_sources_updated_at
BEFORE UPDATE ON public.sources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();