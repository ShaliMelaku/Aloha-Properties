import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface SupabaseUnit {
  id: string;
  property_id: string;
  type: string;
  beds: number;
  baths: number;
  sqm: number;
  price: number;
  variety_img: string; // Floorplan image
  is_sold: boolean;
}

export interface SupabaseProgress {
  id: string;
  property_id: string;
  percent: number;
  status: string;
  status_text: string;
  estimated_completion: string;
}

export interface SupabaseProperty {
  id: string;
  name: string;
  developer: string; // Added
  location: string;
  cover_image: string; // Standardized
  lat: number; // Added
  lng: number; // Added
  price_start?: number;
  pay_schedule?: string;
  amenities: string[];
  discount_percentage?: number; // Added
  downpayment_percentage?: number; // Added
  description?: string;
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
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown database failure'));
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, []);

  return { properties, loading, error };
}
