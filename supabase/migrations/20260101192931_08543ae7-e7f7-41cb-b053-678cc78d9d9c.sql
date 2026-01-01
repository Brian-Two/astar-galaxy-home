-- Create planets table for user learning subjects
CREATE TABLE public.planets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#4A90E2',
  last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.planets ENABLE ROW LEVEL SECURITY;

-- Users can view their own planets
CREATE POLICY "Users can view their own planets"
ON public.planets
FOR SELECT
USING (auth.uid() = created_by);

-- Users can create their own planets
CREATE POLICY "Users can create their own planets"
ON public.planets
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Users can update their own planets
CREATE POLICY "Users can update their own planets"
ON public.planets
FOR UPDATE
USING (auth.uid() = created_by);

-- Users can delete their own planets
CREATE POLICY "Users can delete their own planets"
ON public.planets
FOR DELETE
USING (auth.uid() = created_by);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_planets_updated_at
BEFORE UPDATE ON public.planets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster queries by user
CREATE INDEX idx_planets_created_by ON public.planets(created_by);

-- Enable realtime for planets table
ALTER PUBLICATION supabase_realtime ADD TABLE public.planets;