import { LucideIcon } from "lucide-react";

export type StatusType = 'success' | 'error' | 'info';

export interface Lead {
  id?: string;
  name: string;
  email: string;
  interest?: string;
  created_at?: string;
  status?: 'new' | 'contacted' | 'qualified' | 'closed' | 'lost';
  notes?: string;
  phone?: string;
  batch_id?: string;
}

export interface LeadBatch {
  id: string;
  name: string;
  lead_count: number;
  created_at: string;
}

export interface Campaign {
  id: string;
  created_at: string;
  subject: string;
  body?: string;
  target_filter?: string;
  audience_size: number;
}

export interface PropertyProgress {
  id: string;
  property_id: string;
  percent: number;
  percentage: number; // Added for compatibility
  status: 'planning' | 'under-construction' | 'topping-out' | 'finishing' | 'delivered';
  status_text: string;
  label?: string; // Added for compatibility
  created_at: string;
}

export interface Property {
  id: string;
  name: string;
  location: string;
  developer: string;
  description?: string;
  lat: number;
  lng: number;
  amenities: string[];
  cover_image: string;
  images?: string[];
  video_url?: string;
  is_deleted?: boolean;
  discount_percentage?: number;
  downpayment_percentage?: number;
  payment_schedule?: string;
  air_quality_index: number;
  urban_heat_index: number;
  env_risk_level: string;
  price_start: number;
  completion_date?: string;
  units?: Unit[];
  unit_types?: UnitType[];
  progress?: PropertyProgress[];
  created_at?: string;
  // Extended Fields
  property_type?: 'Villa' | 'Apartment' | 'Compound' | 'Village' | 'Commercial';
  tenure_type?: string;
  parking_spots?: number;
  virtual_tour_url?: string;
  total_sqm?: number;
  loan_percentage?: number;
  discount_rules?: { downpayment: number; discount: number }[];
  discount_conditions?: string;
  pdf_brochure_url?: string;
}

export interface UnitType {
  id?: string;
  property_id?: string;
  name: string;
  beds: number;
  baths: number;
  sqm: number;
  price_from: number;
  type_image?: string;
  total_units: number;
  description?: string;
  amenities?: string[];
  discount_rules?: { downpayment: number; discount: number }[];
  payment_schedule?: string;
  downpayment_percentage?: number;
  status?: 'available' | 'sold_out';
}

export interface Unit {
  id: string;
  property_id: string;
  unit_type_id: string;
  unit_number: string;
  floor_number: number;
  status: 'available' | 'reserved' | 'sold';
  price: number;
  image_url?: string;
  notes?: string;
  // Extended Fields
  view_type?: string;
  balcony_sqm?: number;
  is_furnished?: boolean;
  discount_rules?: { downpayment: number; discount: number }[];
  payment_schedule?: string;
  downpayment_percentage?: number;
  availability_date?: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  created_at: string;
  cover_image: string;
  file_url?: string;
  video_url: string;
  source_label: string;
  source_url: string;
  type: 'article' | 'report' | 'guide';
  is_deleted: boolean;
}

export interface AdminTab {
  id: string;
  icon: LucideIcon;
  label: string;
}

export interface TrustedCompany {
  id?: string;
  name: string;
  logo_url?: string;
  website_url?: string;
  description?: string;
  category?: string;
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
}

export interface AdminActivity {
  id?: string;
  admin_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: string;
  created_at?: string;
}
