import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Source {
  id: string;
  planet_id: string;
  user_id: string;
  title: string;
  type: 'link' | 'file' | 'text';
  content?: string;
  url?: string;
  file_path?: string;
  created_at: string;
}

interface UsePlanetSourcesOptions {
  enableRealtime?: boolean;
}

export function usePlanetSources(planetId: string | undefined, options: UsePlanetSourcesOptions = {}) {
  const { enableRealtime = false } = options;
  const { user } = useAuth();
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSources = useCallback(async () => {
    if (!user || !planetId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .eq('planet_id', planetId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedSources = (data || []).map(s => ({
        ...s,
        type: s.type as 'link' | 'file' | 'text'
      }));
      
      setSources(typedSources);
    } catch (error) {
      console.error('Error fetching sources:', error);
      toast.error('Failed to load sources');
    } finally {
      setLoading(false);
    }
  }, [user, planetId]);

  // Initial fetch
  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  // Realtime subscription
  useEffect(() => {
    if (!enableRealtime || !planetId || !user) return;

    const channel = supabase
      .channel(`sources-${planetId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sources',
          filter: `planet_id=eq.${planetId}`,
        },
        (payload) => {
          console.log('Realtime source update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newSource = {
              ...payload.new,
              type: payload.new.type as 'link' | 'file' | 'text'
            } as Source;
            
            // Only add if not deleted
            if (!payload.new.is_deleted) {
              setSources(prev => {
                // Check if already exists
                if (prev.some(s => s.id === newSource.id)) return prev;
                return [newSource, ...prev];
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new.is_deleted) {
              // Remove if soft deleted
              setSources(prev => prev.filter(s => s.id !== payload.new.id));
            } else {
              // Update existing
              setSources(prev => prev.map(s => 
                s.id === payload.new.id 
                  ? { ...payload.new, type: payload.new.type as 'link' | 'file' | 'text' } as Source
                  : s
              ));
            }
          } else if (payload.eventType === 'DELETE') {
            setSources(prev => prev.filter(s => s.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enableRealtime, planetId, user]);

  const addSource = useCallback(async (
    type: 'link' | 'file' | 'text',
    title: string,
    content?: string
  ): Promise<Source | null> => {
    if (!user || !planetId || !title.trim()) return null;

    try {
      const sourceData = {
        planet_id: planetId,
        user_id: user.id,
        title: title.trim(),
        type,
        url: type === 'link' ? content?.trim() : undefined,
        content: type !== 'link' ? content?.trim() : undefined,
      };

      const { data, error } = await supabase
        .from('sources')
        .insert(sourceData)
        .select()
        .single();

      if (error) throw error;

      const typedSource = {
        ...data,
        type: data.type as 'link' | 'file' | 'text'
      };

      // Optimistic update (realtime will also catch this)
      if (!enableRealtime) {
        setSources(prev => [typedSource, ...prev]);
      }
      
      toast.success('Source added!');
      return typedSource;
    } catch (error) {
      console.error('Error adding source:', error);
      toast.error('Failed to add source');
      return null;
    }
  }, [user, planetId, enableRealtime]);

  const removeSource = useCallback(async (sourceId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('sources')
        .update({ is_deleted: true })
        .eq('id', sourceId);

      if (error) throw error;

      // Optimistic update (realtime will also catch this)
      if (!enableRealtime) {
        setSources(prev => prev.filter(s => s.id !== sourceId));
      }
      
      toast.success('Source removed');
      return true;
    } catch (error) {
      console.error('Error removing source:', error);
      toast.error('Failed to remove source');
      return false;
    }
  }, [enableRealtime]);

  return {
    sources,
    loading,
    addSource,
    removeSource,
    refetch: fetchSources,
  };
}
