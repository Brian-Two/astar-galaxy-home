import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ObjectiveProgress {
  id: string;
  agent_id: string;
  planet_id: string;
  user_id: string;
  objective_index: number;
  status: 'hit' | 'not_hit';
  hit_at: string | null;
}

export function useObjectiveProgress(agentId: string | undefined, planetId: string | undefined) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ObjectiveProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!user || !agentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('objective_progress')
        .select('*')
        .eq('agent_id', agentId)
        .eq('user_id', user.id);

      if (error) throw error;

      setProgress((data || []).map(p => ({
        ...p,
        status: p.status as 'hit' | 'not_hit',
      })));
    } catch (error) {
      console.error('Error fetching objective progress:', error);
    } finally {
      setLoading(false);
    }
  }, [user, agentId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Check if a specific objective is hit
  const isObjectiveHit = useCallback((objectiveIndex: number): boolean => {
    return progress.some(p => p.objective_index === objectiveIndex && p.status === 'hit');
  }, [progress]);

  // Mark an objective as hit
  const markObjectiveHit = useCallback(async (objectiveIndex: number): Promise<boolean> => {
    if (!user || !agentId || !planetId) return false;

    try {
      // Upsert the progress record
      const { data, error } = await supabase
        .from('objective_progress')
        .upsert({
          agent_id: agentId,
          planet_id: planetId,
          user_id: user.id,
          objective_index: objectiveIndex,
          status: 'hit',
          hit_at: new Date().toISOString(),
        }, {
          onConflict: 'agent_id,user_id,objective_index',
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setProgress(prev => {
        const existing = prev.findIndex(p => p.objective_index === objectiveIndex);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = {
            ...data,
            status: data.status as 'hit' | 'not_hit',
          };
          return updated;
        }
        return [...prev, {
          ...data,
          status: data.status as 'hit' | 'not_hit',
        }];
      });

      return true;
    } catch (error) {
      console.error('Error marking objective as hit:', error);
      return false;
    }
  }, [user, agentId, planetId]);

  return {
    progress,
    loading,
    isObjectiveHit,
    markObjectiveHit,
    refetch: fetchProgress,
  };
}
