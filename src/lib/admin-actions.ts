import { supabaseClient } from "./supabase";
import { Lead, Property, Post, Unit, UnitType } from "@/types/admin";

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
  if (type.id) {
    const { error } = await supabaseClient
      .from('property_unit_types')
      .update(type)
      .eq('id', type.id);
    if (error) throw error;
  } else {
    const { error } = await supabaseClient
      .from('property_unit_types')
      .insert(type);
    if (error) throw error;
  }
}

export async function saveUnit(unit: Partial<Unit>) {
  if (unit.id) {
    const { error } = await supabaseClient
      .from('property_units')
      .update(unit)
      .eq('id', unit.id);
    if (error) throw error;
  } else {
    const { error } = await supabaseClient
      .from('property_units')
      .insert(unit);
    if (error) throw error;
  }
}

/**
 * LEAD ACTIONS
 */

export async function saveLead(lead: Partial<Lead>) {
  if (lead.id) {
    const { error } = await supabaseClient
      .from('leads')
      .update(lead)
      .eq('id', lead.id);
    if (error) throw error;
  } else {
    const { error } = await supabaseClient
      .from('leads')
      .insert(lead);
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
  // Remove internal fields that might conflict with DB schema upon insert/update
  const { id, ...payload } = post;
  delete payload.created_at;
  
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
