-- Create agents table for persisting AI agents on planets
CREATE TABLE public.agents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    planet_id UUID NOT NULL REFERENCES public.planets(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    learning_objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
    guardrails JSONB NOT NULL DEFAULT '{}'::jsonb,
    scaffolding_level TEXT NOT NULL DEFAULT 'medium' CHECK (scaffolding_level IN ('light', 'medium', 'heavy')),
    scaffolding_behaviors JSONB NOT NULL DEFAULT '[]'::jsonb,
    source_mode TEXT NOT NULL DEFAULT 'all' CHECK (source_mode IN ('all', 'selected')),
    selected_source_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    times_used INTEGER NOT NULL DEFAULT 0,
    unique_users INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only manage their own agents
CREATE POLICY "Users can view their own agents"
ON public.agents
FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own agents"
ON public.agents
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own agents"
ON public.agents
FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own agents"
ON public.agents
FOR DELETE
USING (auth.uid() = created_by);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_agents_updated_at
BEFORE UPDATE ON public.agents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups by planet
CREATE INDEX idx_agents_planet_id ON public.agents(planet_id);
CREATE INDEX idx_agents_created_by ON public.agents(created_by);