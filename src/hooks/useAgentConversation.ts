import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  agent_id: string;
  planet_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function useAgentConversation(agentId: string | undefined, planetId: string | undefined) {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Get or create the single conversation for this agent+user
  const initializeConversation = useCallback(async () => {
    if (!user || !agentId || !planetId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Try to find existing conversation
      const { data: existingConv, error: fetchError } = await supabase
        .from('agent_conversations')
        .select('*')
        .eq('agent_id', agentId)
        .eq('created_by', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      let conv: Conversation;

      if (existingConv) {
        conv = existingConv as Conversation;
      } else {
        // Create new conversation
        const { data: newConv, error: createError } = await supabase
          .from('agent_conversations')
          .insert({
            agent_id: agentId,
            planet_id: planetId,
            created_by: user.id,
          })
          .select()
          .single();

        if (createError) throw createError;
        conv = newConv as Conversation;
      }

      setConversation(conv);

      // Load all messages for this conversation
      const { data: msgs, error: msgsError } = await supabase
        .from('agent_messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: true });

      if (msgsError) throw msgsError;

      setMessages((msgs || []).map(m => ({
        ...m,
        role: m.role as 'user' | 'assistant' | 'system',
      })));
    } catch (error) {
      console.error('Error initializing conversation:', error);
    } finally {
      setLoading(false);
    }
  }, [user, agentId, planetId]);

  useEffect(() => {
    initializeConversation();
  }, [initializeConversation]);

  // Track user usage for this agent (first message triggers unique user count)
  const trackUserUsage = useCallback(async (agentId: string) => {
    if (!user) return;

    try {
      // Try to insert into agent_users - will fail silently on conflict (already tracked)
      const { data: insertedUser, error: insertError } = await supabase
        .from('agent_users')
        .insert({
          agent_id: agentId,
          user_id: user.id,
        })
        .select()
        .maybeSingle();

      // If insert succeeded (new user for this agent), increment unique_users
      if (insertedUser && !insertError) {
        // Get current agent stats
        const { data: agent } = await supabase
          .from('agents')
          .select('unique_users')
          .eq('id', agentId)
          .single();

        if (agent) {
          await supabase
            .from('agents')
            .update({ unique_users: (agent.unique_users || 0) + 1 })
            .eq('id', agentId);
        }
      }

      // Always increment times_used for each message
      const { data: agent } = await supabase
        .from('agents')
        .select('times_used')
        .eq('id', agentId)
        .single();

      if (agent) {
        await supabase
          .from('agents')
          .update({ times_used: (agent.times_used || 0) + 1 })
          .eq('id', agentId);
      }
    } catch (error) {
      console.error('Error tracking usage:', error);
    }
  }, [user]);

  // Add a user message
  const addUserMessage = useCallback(async (content: string): Promise<Message | null> => {
    if (!conversation || !agentId) return null;

    try {
      const { data, error } = await supabase
        .from('agent_messages')
        .insert({
          conversation_id: conversation.id,
          role: 'user',
          content,
        })
        .select()
        .single();

      if (error) throw error;

      const newMsg: Message = {
        ...data,
        role: data.role as 'user' | 'assistant' | 'system',
      };

      setMessages(prev => [...prev, newMsg]);

      // Track usage for this agent
      await trackUserUsage(agentId);

      // Update conversation updated_at
      await supabase
        .from('agent_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation.id);

      return newMsg;
    } catch (error) {
      console.error('Error adding user message:', error);
      return null;
    }
  }, [conversation, agentId, trackUserUsage]);

  // Add an assistant message
  const addAssistantMessage = useCallback(async (content: string): Promise<Message | null> => {
    if (!conversation) return null;

    try {
      const { data, error } = await supabase
        .from('agent_messages')
        .insert({
          conversation_id: conversation.id,
          role: 'assistant',
          content,
        })
        .select()
        .single();

      if (error) throw error;

      const newMsg: Message = {
        ...data,
        role: data.role as 'user' | 'assistant' | 'system',
      };

      setMessages(prev => [...prev, newMsg]);

      // Update conversation updated_at
      await supabase
        .from('agent_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation.id);

      return newMsg;
    } catch (error) {
      console.error('Error adding assistant message:', error);
      return null;
    }
  }, [conversation]);

  // Update the last assistant message (for streaming)
  const updateLastAssistantMessage = useCallback((content: string) => {
    setMessages(prev => {
      const lastIdx = prev.length - 1;
      if (lastIdx >= 0 && prev[lastIdx].role === 'assistant') {
        const updated = [...prev];
        updated[lastIdx] = { ...updated[lastIdx], content };
        return updated;
      }
      // If no assistant message exists yet, add a temporary one
      return [...prev, {
        id: 'streaming',
        conversation_id: conversation?.id || '',
        role: 'assistant' as const,
        content,
        created_at: new Date().toISOString(),
      }];
    });
  }, [conversation]);

  // Clear conversation (delete all messages)
  const clearConversation = useCallback(async () => {
    if (!conversation) return;

    try {
      const { error } = await supabase
        .from('agent_messages')
        .delete()
        .eq('conversation_id', conversation.id);

      if (error) throw error;

      setMessages([]);
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  }, [conversation]);

  return {
    conversation,
    messages,
    loading,
    addUserMessage,
    addAssistantMessage,
    updateLastAssistantMessage,
    clearConversation,
    refetch: initializeConversation,
  };
}
