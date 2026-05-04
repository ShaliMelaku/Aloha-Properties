import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// ── Unit Type (e.g. "2BR Deluxe", "Studio") ──────────────────
export interface SupabaseUnitType {
  id: string;
  property_id: string;
  name: string;
  beds: number;
  baths: number;
  sqm: number;
  price_from: number;
  type_image: string;
  total_units: number;
  discount_percentage?: number;
  downpayment_percentage?: number;
  description?: string;
  discount_rules?: { downpayment: number; discount: number }[];
  payment_schedule?: string;
  // Derived: count of units by status for this type
  available_count?: number;
  reserved_count?: number;
  sold_count?: number;
  status?: 'available' | 'sold_out';
  financing_available?: boolean | null;
  financing_types?: string[] | null;
  financing_down_payment_pct?: number | null;
  financing_duration_months?: number | null;
  financing_interest_rate?: number | null;
}

// ── Individual Unit (e.g. "Unit A-101, Floor 4") ──────────────
export interface SupabaseUnit {
  id: string;
  property_id: string;
  unit_type_id?: string;
  unit_number?: string;
  floor_number?: number;
  status: 'available' | 'reserved' | 'sold';
  price?: number;
  notes?: string;
  // Legacy fields (kept for back-compat)
  type?: string;
  beds?: number;
  baths?: number;
  sqm?: number;
  is_sold?: boolean;
  variety_img?: string;
  discount_rules?: { downpayment: number; discount: number }[];
  payment_schedule?: string;
  downpayment_percentage?: number;
  availability_date?: string;
}

// ── Progress ──────────────────────────────────────────────────
export interface SupabaseProgress {
  id: string;
  property_id: string;
  percent: number;
  percentage: number;
  status: string;
  status_text: string;
  label: string;
  estimated_completion: string;
}

// ── Property ──────────────────────────────────────────────────
export interface SupabaseProperty {
  id: string;
  name: string;
  developer: string;
  location: string;
  cover_image: string;
  lat: number;
  lng: number;
  price_start?: number;
  property_type?: 'Villa' | 'Apartment' | 'Compound' | 'Village' | 'Commercial';
  pay_schedule?: string;
  payment_schedule?: string;
  amenities: string[];
  discount_percentage?: number;
  downpayment_percentage?: number;
  description?: string;
  video_url?: string;
  air_quality_index?: number;
  urban_heat_index?: number;
  env_risk_level?: string;
  loan_percentage?: number;
  discount_conditions?: string;
  discount_rules?: { downpayment: number; discount: number }[];
  pdf_brochure_url?: string;
  financing_available?: boolean;
  financing_types?: string[];
  financing_down_payment_pct?: number;
  financing_duration_months?: number;
  financing_interest_rate?: number;
  financing_provider?: string;
  financing_notes?: string;
  unit_types: SupabaseUnitType[];
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
            unit_types:property_unit_types(*),
            units:property_units(*),
            progress:property_progress(*)
          `)
          .order('created_at', { ascending: false });

        if (sbError) throw sbError;

        // Enrich each unit type with live availability counts and normalize progress
        const enriched = (data || []).map((prop) => {
          const enrichedTypes = (prop.unit_types || []).map((ut: SupabaseUnitType) => {
            const typeUnits = (prop.units || []).filter(
              (u: SupabaseUnit) => u.unit_type_id === ut.id
            );
            return {
              ...ut,
              available_count: typeUnits.filter((u: SupabaseUnit) => u.status === 'available').length,
              reserved_count:  typeUnits.filter((u: SupabaseUnit) => u.status === 'reserved').length,
              sold_count:      typeUnits.filter((u: SupabaseUnit) => u.status === 'sold').length,
            };
          });

          const normalizedProgress = (prop.progress || [])
            .map((p: SupabaseProgress) => ({
              ...p,
              percentage: p.percentage ?? p.percent ?? 0,
              percent: p.percent ?? p.percentage ?? 0,
              label: p.label || p.status_text || 'In Progress'
            }))
            .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

          return { ...prop, unit_types: enrichedTypes, progress: normalizedProgress };
        });

        setProperties(enriched as SupabaseProperty[]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown database failure'));
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();

    // ── Realtime Subscription ──────────────────────────────────
    const channel = supabase
      .channel('property-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'properties' },
        () => fetchProperties()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'property_progress' },
        () => fetchProperties()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'property_unit_types' },
        () => fetchProperties()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { properties, loading, error };
}
