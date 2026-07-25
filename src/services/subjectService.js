import { supabase } from "./supabase";

export async function getSubjects() {
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .order("subject_name", { ascending: true });

  if (error) throw error;

  return data;
}

export async function addSubject(subject) {
  const { error } = await supabase
    .from("subjects")
    .insert([subject]);

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
  // Clean up all dependent records across tables to prevent FK constraint errors
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