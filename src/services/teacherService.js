import { supabase } from "./supabase";

export async function getTeachers() {
  const { data, error } = await supabase
    .from("teachers")
    .select("*")
    .order("teacher_name", { ascending: true });

  if (error) throw error;

  return data;
}

export async function addTeacher(teacher) {
  const { error } = await supabase
    .from("teachers")
    .insert([teacher]);

  if (error) throw error;
}

export async function deleteTeacher(id) {
  // Clean up all dependent records across tables to prevent FK constraint errors
  await supabase.from("teacher_availability").delete().eq("teacher_id", id);
  // Update mapping records to set teacher_id to null so subject mappings remain intact (unassigned)
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