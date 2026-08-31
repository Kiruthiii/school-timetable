import { supabase } from "./supabase";
import { getOrCreateWorkspaceId } from "./workspaceService";

export async function getFixedSlots() {
  const { data, error } = await supabase
    .from("fixed_slots")
    .select(`
      *,
      classes (
        id,
        class_name
      )
    `);

  if (error) throw error;
  return data;
}

export async function addFixedSlot(slotData) {
  const { data: existing, error: existingError } = await supabase
    .from("fixed_slots")
    .select("id")
    .eq("class_id", slotData.class_id)
    .eq("day_of_week", slotData.day_of_week)
    .eq("period", slotData.period);

  if (existingError) throw existingError;

  if (existing && existing.length > 0) {
    throw new Error("This class already has a fixed slot for the selected day and period.");
  }

  const workspaceId = await getOrCreateWorkspaceId();
  const payload = workspaceId ? { ...slotData, workspace_id: workspaceId } : slotData;

  const { error } = await supabase
    .from("fixed_slots")
    .insert([payload]);

  if (error) throw error;
}

export async function updateFixedSlot(id, slotData) {
  const { data: existing, error: existingError } = await supabase
    .from("fixed_slots")
    .select("id")
    .eq("class_id", slotData.class_id)
    .eq("day_of_week", slotData.day_of_week)
    .eq("period", slotData.period)
    .neq("id", id);

  if (existingError) throw existingError;

  if (existing && existing.length > 0) {
    throw new Error("This class already has a fixed slot for the selected day and period.");
  }

  const { error } = await supabase
    .from("fixed_slots")
    .update(slotData)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteFixedSlot(id) {
  const { error } = await supabase
    .from("fixed_slots")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
