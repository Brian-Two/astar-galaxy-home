-- Create agent_conversations table for persistent chat threads
CREATE TABLE public.agent_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  planet_id UUID NOT NULL REFERENCES public.planets(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_conversations ENABLE ROW LEVEL SECURITY;

-- Create unique constraint to ensure one conversation per agent per user
CREATE UNIQUE INDEX idx_agent_conversations_unique ON public.agent_conversations(agent_id, created_by);

-- RLS policies for agent_conversations
CREATE POLICY "Users can view their own conversations"
ON public.agent_conversations
FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own conversations"
ON public.agent_conversations
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own conversations"
ON public.agent_conversations
FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own conversations"
ON public.agent_conversations
FOR DELETE
USING (auth.uid() = created_by);

-- Create agent_messages table for chat messages
CREATE TABLE public.agent_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.agent_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_messages ENABLE ROW LEVEL SECURITY;

-- Create index for fast message retrieval
CREATE INDEX idx_agent_messages_conversation ON public.agent_messages(conversation_id, created_at);

-- RLS policies for agent_messages (via conversation ownership)
CREATE POLICY "Users can view messages in their conversations"
ON public.agent_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.agent_conversations
    WHERE id = agent_messages.conversation_id
    AND created_by = auth.uid()
  )
);

CREATE POLICY "Users can insert messages in their conversations"
ON public.agent_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.agent_conversations
    WHERE id = agent_messages.conversation_id
    AND created_by = auth.uid()
  )
);

CREATE POLICY "Users can delete messages in their conversations"
ON public.agent_messages
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.agent_conversations
    WHERE id = agent_messages.conversation_id
    AND created_by = auth.uid()
  )
);

-- Create objective_progress table for persistent learning objective status
CREATE TABLE public.objective_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  planet_id UUID NOT NULL REFERENCES public.planets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  objective_index INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_hit' CHECK (status IN ('hit', 'not_hit')),
  hit_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.objective_progress ENABLE ROW LEVEL SECURITY;

-- Create unique constraint to ensure one progress per objective per user
CREATE UNIQUE INDEX idx_objective_progress_unique ON public.objective_progress(agent_id, user_id, objective_index);

-- RLS policies for objective_progress
CREATE POLICY "Users can view their own objective progress"
ON public.objective_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own objective progress"
ON public.objective_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own objective progress"
ON public.objective_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- Add trigger for updated_at on agent_conversations
CREATE TRIGGER update_agent_conversations_updated_at
BEFORE UPDATE ON public.agent_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on objective_progress
CREATE TRIGGER update_objective_progress_updated_at
BEFORE UPDATE ON public.objective_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();