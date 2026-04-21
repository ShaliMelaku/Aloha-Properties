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
 * PORTFOLIO ACTIONS
 */

export async function createProperty(prop: Partial<Property>) {
  const { data, error } = await supabaseClient
    .from('properties')
    .insert(prop)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProperty(id: string, updates: Partial<Property>) {
  const { error } = await supabaseClient
    .from('properties')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteProperty(id: string) {
  const { error } = await supabaseClient
    .from('properties')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function saveUnitType(type: Partial<UnitType>) {
  const { id, ...payload } = type;
  
  if (id) {
    const { error } = await supabaseClient
      .from('property_unit_types')
      .update(payload)
      .eq('id', id);
    if (error) throw error;
  } else {
    const { error } = await supabaseClient
      .from('property_unit_types')
      .insert(payload);
    if (error) throw error;
  }
}

export async function saveUnit(unit: Partial<Unit>) {
  const { id, ...payload } = unit;
  
  if (id) {
    const { error } = await supabaseClient
      .from('property_units')
      .update(payload)
      .eq('id', id);
    if (error) throw error;
  } else {
    const { error } = await supabaseClient
      .from('property_units')
      .insert(payload);
    if (error) throw error;
  }
}

export async function deleteUnit(id: string) {
  const { error } = await supabaseClient
    .from('property_units')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function deleteUnitType(id: string) {
  const { error } = await supabaseClient
    .from('property_unit_types')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function saveProgress(prog: any) {
  const { id, ...payload } = prog;
  if (id) {
    const { error } = await supabaseClient
      .from('property_progress')
      .update(payload)
      .eq('id', id);
    if (error) throw error;
  } else {
    const { error } = await supabaseClient
      .from('property_progress')
      .insert(payload);
    if (error) throw error;
  }
}

export async function deleteProgress(id: string) {
  const { error } = await supabaseClient
    .from('property_progress')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

/**
 * LEAD ACTIONS
 */

export async function saveLead(lead: Partial<Lead>) {
  const { id, created_at, ...payload } = lead;
  
  if (id) {
    const { error } = await supabaseClient
      .from('leads')
      .update(payload)
      .eq('id', id);
    if (error) throw error;
  } else {
    const { error } = await supabaseClient
      .from('leads')
      .insert(payload);
    if (error) throw error;
  }
}

export async function deleteLead(id: string) {
  const { error } = await supabaseClient
    .from('leads')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

/**
 * CONTENT ACTIONS
 */

export async function savePost(post: Partial<Post>) {
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
  } else {
    const { error } = await supabaseClient
      .from('posts')
      .insert(payload);
    if (error) throw error;
  }
}
