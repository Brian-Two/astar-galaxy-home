import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Planet {
  id: string;
  name: string;
  color: string;
  lastActiveDaysAgo: number;
  lastActiveAt: string;
  createdBy: string;
  createdAt: string;
  stats: {
    assignmentsCompleted: number;
    studySessions: number;
    projects: number;
  };
}

interface DbPlanet {
  id: string;
  name: string;
  color: string;
  last_active_at: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const calculateDaysAgo = (dateStr: string): number => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

const mapDbPlanetToPlanet = (dbPlanet: DbPlanet): Planet => ({
  id: dbPlanet.id,
  name: dbPlanet.name,
  color: dbPlanet.color,
  lastActiveDaysAgo: calculateDaysAgo(dbPlanet.last_active_at),
  lastActiveAt: dbPlanet.last_active_at,
  createdBy: dbPlanet.created_by,
  createdAt: dbPlanet.created_at,
  stats: {
    assignmentsCompleted: 0,
    studySessions: 0,
    projects: 0,
  },
});

export const usePlanets = () => {
  const { user, loading: authLoading } = useAuth();
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlanets = useCallback(async () => {
    if (!user) {
      console.log('[usePlanets] No user, clearing planets');
      setPlanets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log('[usePlanets] Fetching planets for user:', user.id);

    const { data, error } = await supabase
      .from('planets')
      .select('*')
      .eq('created_by', user.id)
      .order('last_active_at', { ascending: false });

    if (error) {
      console.error('[usePlanets] Error fetching planets:', error);
      setPlanets([]);
    } else {
      console.log('[usePlanets] Fetched', data?.length || 0, 'planets');
      setPlanets((data || []).map(mapDbPlanetToPlanet));
    }
    setLoading(false);
  }, [user]);

  // Fetch planets when user changes
  useEffect(() => {
    if (!authLoading) {
      fetchPlanets();
    }
  }, [user, authLoading, fetchPlanets]);

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('planets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'planets',
          filter: `created_by=eq.${user.id}`,
        },
        (payload) => {
          console.log('[usePlanets] Realtime event:', payload.eventType);
          if (payload.eventType === 'INSERT') {
            const newPlanet = mapDbPlanetToPlanet(payload.new as DbPlanet);
            setPlanets((prev) => [newPlanet, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedPlanet = mapDbPlanetToPlanet(payload.new as DbPlanet);
            setPlanets((prev) =>
              prev.map((p) => (p.id === updatedPlanet.id ? updatedPlanet : p))
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as DbPlanet).id;
            setPlanets((prev) => prev.filter((p) => p.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addPlanet = useCallback(
    async (name: string, color: string): Promise<Planet | null> => {
      if (!user) {
        console.error('[usePlanets] Cannot add planet: no user');
        return null;
      }

      // Check limit of 10 planets
      if (planets.length >= 10) {
        console.error('[usePlanets] Cannot add planet: max 10 planets reached');
        return null;
      }

      console.log('[usePlanets] Creating planet:', { name, color, userId: user.id });

      const { data, error } = await supabase
        .from('planets')
        .insert({
          name,
          color,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('[usePlanets] Error creating planet:', error);
        return null;
      }

      console.log('[usePlanets] Created planet:', data.id);
      return mapDbPlanetToPlanet(data);
    },
    [user, planets.length]
  );

  const updatePlanet = useCallback(
    async (id: string, updates: { name?: string; color?: string }): Promise<boolean> => {
      if (!user) return false;

      console.log('[usePlanets] Updating planet:', id, updates);

      const { error } = await supabase
        .from('planets')
        .update({
          ...updates,
          last_active_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('created_by', user.id);

      if (error) {
        console.error('[usePlanets] Error updating planet:', error);
        return false;
      }

      return true;
    },
    [user]
  );

  const deletePlanet = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) return false;

      console.log('[usePlanets] Deleting planet:', id);

      const { error } = await supabase
        .from('planets')
        .delete()
        .eq('id', id)
        .eq('created_by', user.id);

      if (error) {
        console.error('[usePlanets] Error deleting planet:', error);
        return false;
      }

      return true;
    },
    [user]
  );

  const touchPlanet = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) return false;

      const { error } = await supabase
        .from('planets')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', id)
        .eq('created_by', user.id);

      return !error;
    },
    [user]
  );

  return {
    planets,
    loading: authLoading || loading,
    addPlanet,
    updatePlanet,
    deletePlanet,
    touchPlanet,
    refetch: fetchPlanets,
  };
};
