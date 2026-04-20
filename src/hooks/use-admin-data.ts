import { useState, useCallback } from 'react';
import { supabaseClient } from '@/lib/supabase';
import { Lead, Property, Post, Campaign } from '@/types/admin';

export function useAdminData() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [history, setHistory] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    const { data, error } = await supabaseClient
      .from('properties')
      .select('*, units:property_units(*), unit_types:property_unit_types(*), progress:property_progress(*)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    setProperties(data || []);
    return data;
  }, []);

  const fetchLeads = useCallback(async () => {
    const { data, error } = await supabaseClient
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    setLeads(data || []);
    return data;
  }, []);

  const fetchPosts = useCallback(async () => {
    const { data, error } = await supabaseClient
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    setPosts(data || []);
    return data;
  }, []);

  const fetchHistory = useCallback(async () => {
    const { data, error } = await supabaseClient
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    setHistory(data || []);
    return data;
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProperties(),
        fetchLeads(),
        fetchPosts(),
        fetchHistory()
      ]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown hook error');
    } finally {
      setLoading(false);
    }
  }, [fetchProperties, fetchLeads, fetchPosts, fetchHistory]);

  return {
    properties,
    leads,
    posts,
    history,
    loading,
    error,
    refreshAll,
    fetchProperties,
    fetchLeads,
    fetchPosts,
    fetchHistory
  };
}
