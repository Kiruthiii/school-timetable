import { supabase } from "./supabase";
import { getOrCreateWorkspaceId } from "./workspaceService";

export async function getTeacherAvailabilityByDate(date) {
  const { data, error } = await supabase
    .from("teacher_availability")
    .select("*")
    .eq("date", date);

  if (error) throw error;
  return data;
}

export async function setTeacherAvailability(teacherId, date, status, session = null) {
  if (status === 'Available') {
    const { error } = await supabase
      .from("teacher_availability")
      .delete()
      .eq("teacher_id", teacherId)
      .eq("date", date);

    if (error) throw error;
  } else {
    const { data: existing } = await supabase
      .from("teacher_availability")
      .select("id")
      .eq("teacher_id", teacherId)
      .eq("date", date)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("teacher_availability")
        .update({ status, session })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const workspaceId = await getOrCreateWorkspaceId();
      const payload = { teacher_id: teacherId, date, status, session };
      if (workspaceId) payload.workspace_id = workspaceId;

      const { error } = await supabase
        .from("teacher_availability")
        .insert([payload]);
      if (error) throw error;
    }
  }
}
