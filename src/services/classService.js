import { supabase } from "./supabase";

export async function getClasses() {
  const { data, error } = await supabase
    .from("classes")
    .select(`
      *,
      teachers (
        id,
        teacher_name
      )
    `)
    .order("class_name", { ascending: true });

  if (error) throw error;

  return data;
}

export async function addClass(classData) {
  const { error } = await supabase
    .from("classes")
    .insert([classData]);

  if (error) throw error;
}

export async function updateClass(id, classData) {
  const { error } = await supabase
    .from("classes")
    .update(classData)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteClass(id) {
  // Clean up all dependent records across tables to prevent FK constraint errors
  await supabase.from("class_subject_teacher").delete().eq("class_id", id);
  await supabase.from("fixed_slots").delete().eq("class_id", id);
  await supabase.from("timetable").delete().eq("class_id", id);
  await supabase.from("weekly_progress").delete().eq("class_id", id);

  const { error } = await supabase
    .from("classes")
    .delete()
    .eq("id", id);

  if (error) throw error;
}