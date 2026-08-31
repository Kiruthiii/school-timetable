import { supabase } from "./supabase";
import { getOrCreateWorkspaceId } from "./workspaceService";

export async function getTeachers() {
  const { data, error } = await supabase
    .from("teachers")
    .select("*")
    .order("teacher_name", { ascending: true });

  if (error) throw error;
  return data;
}

export async function addTeacher(teacher) {
  const workspaceId = await getOrCreateWorkspaceId();
  const payload = workspaceId ? { ...teacher, workspace_id: workspaceId } : teacher;

  const { error } = await supabase
    .from("teachers")
    .insert([payload]);

  if (error) throw error;
}

export async function deleteTeacher(id) {
  // Clean up dependent records across tables
  await supabase.from("teacher_availability").delete().eq("teacher_id", id);
  await supabase.from("class_subject_teacher").update({ teacher_id: null }).eq("teacher_id", id);
  await supabase.from("fixed_slots").delete().eq("teacher_id", id);
  await supabase.from("timetable").delete().eq("teacher_id", id);
  await supabase.from("classes").update({ class_teacher_id: null }).eq("class_teacher_id", id);

  const { error } = await supabase
    .from("teachers")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function updateTeacher(id, teacher) {
  const { error } = await supabase
    .from("teachers")
    .update(teacher)
    .eq("id", id);

  if (error) throw error;
}