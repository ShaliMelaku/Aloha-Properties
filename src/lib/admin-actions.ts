import { supabaseClient } from "./supabase";
import { Lead, Property, Post, Unit, UnitType } from "@/types/admin";

/**
 * HELPER: Generate slug from text
 */
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')  // Remove all non-word chars
    .replace(/--+/g, '-');    // Replace multiple - with single -
}

/**
 * ACTIVITY LOGGING
 */
export async function logActivity(action: string, entityType?: string, entityId?: string, details?: string) {
  try {
    await supabaseClient.from('admin_activity').insert({
      action,
      entity_type: entityType,
      entity_id: entityId,
      details
    });
  } catch (e) {
    console.error('Activity logging failed:', e);
  }
}

/**
 * PORTFOLIO ACTIONS
 */

const ALLOWED_PROPERTY_FIELDS = [
  'name', 'location', 'developer', 'description', 'lat', 'lng', 
  'amenities', 'images', 'cover_image', 'video_url', 'discount_percentage', 
  'downpayment_percentage', 'payment_schedule', 'air_quality_index', 
  'env_risk_level', 'urban_heat_index', 'tenure_type', 'parking_spots', 
  'virtual_tour_url', 'total_sqm', 'completion_date', 'property_type', 
  'loan_percentage', 'discount_conditions', 'discount_rules', 
  'pdf_brochure_url', 'price_start', 'is_deleted'
];

function sanitizePayload(payload: Partial<Property>) {
  const sanitized: Record<string, any> = {};
  for (const key of ALLOWED_PROPERTY_FIELDS) {
    if (key in payload) {
      sanitized[key] = (payload as any)[key];
    }
  }
  return sanitized;
}

export async function createProperty(prop: Partial<Property>) {
  const payload = sanitizePayload(prop);

  const { data, error } = await supabaseClient
    .from('properties')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  await logActivity('Property Created', 'property', data.id, prop.name);
  return data;
}

export async function updateProperty(id: string, updates: Partial<Property>) {
  const payload = sanitizePayload(updates);

  const { error } = await supabaseClient
    .from('properties')
    .update(payload)
    .eq('id', id);
  if (error) throw error;
  await logActivity('Property Updated', 'property', id, updates.name);
}

export async function deleteProperty(id: string) {
  const { error } = await supabaseClient
    .from('properties')
    .delete()
    .eq('id', id);
  if (error) throw error;
  await logActivity('Property Deleted', 'property', id);
}

export async function saveUnitType(type: Partial<UnitType>) {
  const { id, ...payload } = type;
  
  if (id) {
    const { error } = await supabaseClient
      .from('property_unit_types')
      .update(payload)
      .eq('id', id);
    if (error) throw error;
    await logActivity('Unit Type Updated', 'unit_type', id, type.name);
  } else {
    const { data, error } = await supabaseClient
      .from('property_unit_types')
      .insert(payload)
      .select().single();
    if (error) throw error;
    await logActivity('Unit Type Created', 'unit_type', data.id, type.name);
  }
}

export async function saveUnit(unit: Partial<Unit>) {
  const { id, ...payload } = unit;
  
  if (id && id.trim() !== '') {
    const { error } = await supabaseClient
      .from('property_units')
      .update(payload)
      .eq('id', id);
    if (error) throw error;
    await logActivity('Unit Instance Updated', 'unit', id, unit.unit_number);
  } else {
    const { data, error } = await supabaseClient
      .from('property_units')
      .insert(payload)
      .select().single();
    if (error) throw error;
    await logActivity('Unit Instance Created', 'unit', data.id, unit.unit_number);
  }
}

export async function deleteUnit(id: string) {
  const { error } = await supabaseClient
    .from('property_units')
    .delete()
    .eq('id', id);
  if (error) throw error;
  await logActivity('Unit Instance Deleted', 'unit', id);
}

export async function deleteUnitType(id: string) {
  const { error } = await supabaseClient
    .from('property_unit_types')
    .delete()
    .eq('id', id);
  if (error) throw error;
  await logActivity('Unit Type Deleted', 'unit_type', id);
}

interface ProgressInput {
  id?: string;
  property_id: string;
  label?: string;
  status_text?: string;
  percentage?: number;
  percent?: number;
}

export async function saveProgress(prog: ProgressInput) {
  const { id, ...rest } = prog;
  
  const payload = {
    property_id: rest.property_id,
    label: rest.label || rest.status_text || 'New Phase',
    percentage: rest.percentage !== undefined ? rest.percentage : (rest.percent || 0),
    status_text: rest.label || rest.status_text || 'New Phase',
    percent: rest.percentage !== undefined ? rest.percentage : (rest.percent || 0),
    status: rest.percentage === 100 ? 'delivered' : 'under-construction'
  };

  if (id && typeof id === 'string' && id.trim() !== '') {
    const { error } = await supabaseClient
      .from('property_progress')
      .update(payload)
      .eq('id', id);
    if (error) throw error;
    await logActivity('Progress Updated', 'progress', id, payload.label);
  } else {
    const { data, error } = await supabaseClient
      .from('property_progress')
      .insert(payload)
      .select().single();
    if (error) throw error;
    await logActivity('Progress Created', 'progress', data.id, payload.label);
  }
}

export async function deleteProgress(id: string) {
  const { error } = await supabaseClient
    .from('property_progress')
    .delete()
    .eq('id', id);
  if (error) throw error;
  await logActivity('Progress Deleted', 'progress', id);
}

/**
 * LEAD ACTIONS
 */

export async function createLeadBatch(name: string, lead_count: number) {
  const { data, error } = await supabaseClient
    .from('lead_batches')
    .insert({ name, lead_count })
    .select()
    .single();
  if (error) throw error;
  await logActivity('Lead Batch Created', 'lead_batch', data.id, name);
  return data;
}

export async function saveLead(lead: Partial<Lead>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, created_at, ...payload } = lead;
  
  if (id) {
    const { error } = await supabaseClient
      .from('leads')
      .update(payload)
      .eq('id', id);
    if (error) throw error;
    await logActivity('Lead Updated', 'lead', id, lead.name);
  } else {
    const { data, error } = await supabaseClient
      .from('leads')
      .insert(payload)
      .select().single();
    if (error) throw error;
    await logActivity('Lead Created', 'lead', data.id, lead.name);
  }
}

export async function deleteLead(id: string) {
  const { error } = await supabaseClient
    .from('leads')
    .delete()
    .eq('id', id);
  if (error) throw error;
  await logActivity('Lead Deleted', 'lead', id);
}

/**
 * CONTENT ACTIONS
 */

export async function savePost(post: Partial<Post>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, created_at, ...payload } = post;
  
  // Ensure slug exists
  if (!payload.slug && payload.title) {
    payload.slug = slugify(payload.title);
  } else if (!payload.slug) {
    payload.slug = `post-${Date.now()}`;
  }

  if (id) {
    const { error } = await supabaseClient
      .from('posts')
      .update(payload)
      .eq('id', id);
    if (error) throw error;
    await logActivity('Article Updated', 'post', id, post.title);
  } else {
    const { data, error } = await supabaseClient
      .from('posts')
      .insert(payload)
      .select().single();
    if (error) throw error;
    await logActivity('Article Created', 'post', data.id, post.title);
  }
}

