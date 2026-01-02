-- Create agent_users table to track unique users per agent
CREATE TABLE public.agent_users (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    first_used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (agent_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.agent_users ENABLE ROW LEVEL SECURITY;

-- Create policies for agent_users
CREATE POLICY "Users can insert their own usage records"
ON public.agent_users
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view usage records for their agents"
ON public.agent_users
FOR SELECT
USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.agents 
        WHERE agents.id = agent_users.agent_id 
        AND agents.created_by = auth.uid()
    )
);

-- Add index for faster lookups
CREATE INDEX idx_agent_users_agent_id ON public.agent_users(agent_id);
CREATE INDEX idx_agent_users_user_id ON public.agent_users(user_id);