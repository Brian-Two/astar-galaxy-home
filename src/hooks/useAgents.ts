import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Agent, LearningObjective, AgentGuardrails, ScaffoldingLevel, AgentTemplate } from '@/components/planet/types';

interface DbAgent {
  id: string;
  planet_id: string;
  created_by: string;
  type: string;
  name: string;
  description: string | null;
  learning_objectives: unknown;
  guardrails: unknown;
  scaffolding_level: string;
  scaffolding_behaviors: unknown;
  source_mode: string;
  selected_source_ids: unknown;
  times_used: number;
  unique_users: number;
  created_at: string;
  updated_at: string;
}

function mapDbAgentToAgent(db: DbAgent): Agent {
  const objectives = (db.learning_objectives as string[] || []).map((text, i) => ({
    id: `obj-${i}`,
    text,
    showToOthers: true,
  }));

  const guardrails: AgentGuardrails = {
    dontGiveFullAnswers: true,
    askWhatKnown: true,
    stayWithinSources: true,
    keepConcise: false,
    customAvoid: '',
    ...(db.guardrails as Partial<AgentGuardrails> || {}),
  };

  return {
    id: db.id,
    name: db.name,
    template: db.type as AgentTemplate,
    description: db.description || '',
    learningObjectives: objectives,
    selectedSourceIds: db.selected_source_ids as string[] || [],
    useAllSources: db.source_mode === 'all',
    guardrails,
    scaffoldingLevel: db.scaffolding_level as ScaffoldingLevel,
    scaffoldingBehaviors: db.scaffolding_behaviors as string[] || [],
    timesUsed: db.times_used,
    uniqueUsers: db.unique_users,
    createdAt: new Date(db.created_at),
    planetId: db.planet_id,
  };
}

interface CreateAgentData {
  name: string;
  template: AgentTemplate;
  description: string;
  learningObjectives: LearningObjective[];
  selectedSourceIds: string[];
  useAllSources: boolean;
  guardrails: AgentGuardrails;
  scaffoldingLevel: ScaffoldingLevel;
  scaffoldingBehaviors: string[];
  planetId: string;
}

export function useAgents(planetId: string | undefined) {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = useCallback(async () => {
    if (!user || !planetId) {
      setAgents([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('planet_id', planetId)
        .eq('created_by', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setAgents((data as DbAgent[] || []).map(mapDbAgentToAgent));
    } catch (error) {
      console.error('Error fetching agents:', error);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, [user, planetId]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const createAgent = async (data: CreateAgentData): Promise<Agent | null> => {
    if (!user) return null;

    // Check limit of 10 agents per planet
    if (agents.length >= 10) {
      console.error('Cannot create agent: max 10 agents per planet reached');
      return null;
    }

    try {
      const { data: inserted, error } = await supabase
        .from('agents')
        .insert({
          planet_id: data.planetId,
          created_by: user.id,
          type: data.template,
          name: data.name,
          description: data.description,
          learning_objectives: data.learningObjectives.map(o => o.text) as unknown as string,
          guardrails: data.guardrails as unknown as string,
          scaffolding_level: data.scaffoldingLevel,
          scaffolding_behaviors: data.scaffoldingBehaviors as unknown as string,
          source_mode: data.useAllSources ? 'all' : 'selected',
          selected_source_ids: data.selectedSourceIds as unknown as string,
        })
        .select()
        .single();

      if (error) throw error;

      const newAgent = mapDbAgentToAgent(inserted as DbAgent);
      setAgents(prev => [...prev, newAgent]);
      return newAgent;
    } catch (error) {
      console.error('Error creating agent:', error);
      return null;
    }
  };

  const updateAgent = async (agentId: string, updates: Partial<CreateAgentData>): Promise<boolean> => {
    if (!user) return false;

    try {
      const updateData: Record<string, unknown> = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.template !== undefined) updateData.type = updates.template;
      if (updates.learningObjectives !== undefined) {
        updateData.learning_objectives = updates.learningObjectives.map(o => o.text);
      }
      if (updates.guardrails !== undefined) updateData.guardrails = updates.guardrails;
      if (updates.scaffoldingLevel !== undefined) updateData.scaffolding_level = updates.scaffoldingLevel;
      if (updates.scaffoldingBehaviors !== undefined) updateData.scaffolding_behaviors = updates.scaffoldingBehaviors;
      if (updates.useAllSources !== undefined) updateData.source_mode = updates.useAllSources ? 'all' : 'selected';
      if (updates.selectedSourceIds !== undefined) updateData.selected_source_ids = updates.selectedSourceIds;

      const { error } = await supabase
        .from('agents')
        .update(updateData)
        .eq('id', agentId)
        .eq('created_by', user.id);

      if (error) throw error;

      await fetchAgents();
      return true;
    } catch (error) {
      console.error('Error updating agent:', error);
      return false;
    }
  };

  const deleteAgent = async (agentId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', agentId)
        .eq('created_by', user.id);

      if (error) throw error;

      setAgents(prev => prev.filter(a => a.id !== agentId));
      return true;
    } catch (error) {
      console.error('Error deleting agent:', error);
      return false;
    }
  };

  const incrementUsage = async (agentId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Get current values
      const agent = agents.find(a => a.id === agentId);
      if (!agent) return false;

      const { error } = await supabase
        .from('agents')
        .update({
          times_used: agent.timesUsed + 1,
          unique_users: agent.uniqueUsers + 1, // Simplified - in production you'd track unique users properly
        })
        .eq('id', agentId);

      if (error) throw error;

      setAgents(prev => prev.map(a => 
        a.id === agentId 
          ? { ...a, timesUsed: a.timesUsed + 1, uniqueUsers: a.uniqueUsers + 1 }
          : a
      ));
      return true;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }
  };

  return {
    agents,
    loading,
    createAgent,
    updateAgent,
    deleteAgent,
    incrementUsage,
    refetch: fetchAgents,
  };
}
