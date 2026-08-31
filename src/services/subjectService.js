import { supabase } from "./supabase";
import { getOrCreateWorkspaceId } from "./workspaceService";

export async function getSubjects() {
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .order("subject_name", { ascending: true });

  if (error) throw error;
  return data;
}

export async function addSubject(subject) {
  const workspaceId = await getOrCreateWorkspaceId();
  const payload = workspaceId ? { ...subject, workspace_id: workspaceId } : subject;

  const { error } = await supabase
    .from("subjects")
    .insert([payload]);

  if (error) throw error;
}

export async function updateSubject(id, subject) {
  const { error } = await supabase
    .from("subjects")
    .update(subject)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteSubject(id) {
  await supabase.from("class_subject_teacher").delete().eq("subject_id", id);
  await supabase.from("fixed_slots").delete().eq("subject_id", id);
  await supabase.from("timetable").delete().eq("subject_id", id);
  await supabase.from("weekly_progress").delete().eq("subject_id", id);

  const { error } = await supabase
    .from("subjects")
    .delete()
    .eq("id", id);

  if (error) throw error;
}