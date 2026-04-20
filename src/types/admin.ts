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
}

export interface Campaign {
  id: string;
  created_at: string;
  subject: string;
  audience_size: number;
}

export interface PropertyProgress {
  id: string;
  property_id: string;
  percent: number;
  status: 'planning' | 'under-construction' | 'topping-out' | 'finishing' | 'delivered';
  status_text: string;
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
  units?: Unit[];
  unit_types?: UnitType[];
  progress?: PropertyProgress[];
  created_at?: string;
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
}

export interface Unit {
  id: string;
  property_id: string;
  unit_type_id: string;
  unit_number: string;
  floor_number: number;
  status: 'available' | 'reserved' | 'sold';
  price: number;
  notes?: string;
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
