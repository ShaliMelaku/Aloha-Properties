import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface SupabaseUnit {
  id: string;
  type: string;
  beds: number;
  baths: number;
  sqm: number;
  price: number;
  variety_img: string;
}

export interface SupabaseProgress {
  id: string;
  percent: number;
  status: string;
  status_text: string;
  estimated_completion: string;
}

export interface SupabaseProperty {
  id: string;
  name: string;
  location: string;
  developer: string;
  lat: number;
  lng: number;
  amenities: string[];
  units: SupabaseUnit[];
  progress: SupabaseProgress[];
}

export function useProperties() {
  const [properties, setProperties] = useState<SupabaseProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProperties() {
      try {
        const { data, error: sbError } = await supabase
          .from('properties')
          .select(`
            *,
            units:property_units(*),
            progress:property_progress(*)
          `)
          .order('created_at', { ascending: false });

        if (sbError) throw sbError;
        setProperties(data as SupabaseProperty[]);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, []);

  return { properties, loading, error };
}
