import { useState, useCallback } from 'react';
import { supabaseClient } from '@/lib/supabase';
import { Lead, Property, Post, Campaign, LeadResponse, AdminActivity } from '@/types/admin';

interface DBResponse extends LeadResponse {
  leads?: { name: string; email: string };
  campaigns?: { subject: string };
}

export function useAdminData() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [history, setHistory] = useState<Campaign[]>([]);
  const [responses, setResponses] = useState<LeadResponse[]>([]);
  const [activities, setActivities] = useState<AdminActivity[]>([]);
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

  const fetchResponses = useCallback(async () => {
    const { data, error } = await supabaseClient
      .from('lead_responses')
      .select('*, leads(name, email), campaigns(subject)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const formatted = (data as unknown as DBResponse[])?.map(r => ({
      ...r,
      lead_name: r.leads?.name,
      lead_email: r.leads?.email,
      campaign_subject: r.campaigns?.subject
    })) || [];

    setResponses(formatted);
    return formatted;
  }, []);

  const fetchActivities = useCallback(async () => {
    const { data, error } = await supabaseClient
      .from('admin_activity')
      .select('*, profiles:admin_id(id)') // Assuming we want user profiles, but for now we'll just use the raw data
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    
    // For now, we'll hardcode the admin name if it's the current user or just show "System Admin"
    // Ideally we would join with a profiles table
    const formatted = data?.map((a: any) => ({
      ...a,
      admin_name: "Shalom Melaku" // Fallback/Simulator for now as requested
    })) || [];

    setActivities(formatted);
    return formatted;
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProperties(),
        fetchLeads(),
        fetchPosts(),
        fetchHistory(),
        fetchResponses(),
        fetchActivities()
      ]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown hook error');
    } finally {
      setLoading(false);
    }
  }, [fetchProperties, fetchLeads, fetchPosts, fetchHistory, fetchResponses, fetchActivities]);

  return {
    properties,
    leads,
    posts,
    history,
    responses,
    activities,
    loading,
    error,
    refreshAll,
    fetchProperties,
    fetchLeads,
    fetchPosts,
    fetchHistory,
    fetchResponses,
    fetchActivities
  };
}
