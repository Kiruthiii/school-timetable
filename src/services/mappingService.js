import { supabase } from "./supabase";

export async function getMappings() {
  const { data, error } = await supabase
    .from("class_subject_teacher")
    .select(`
      *,
      classes (
        class_name
      ),
      subjects (
        subject_name
      ),
      teachers (
        teacher_name
      )
    `)
    .order("id");

  if (error) throw error;

  return data;
}

export async function addMapping(mapping) {
  const { error } = await supabase
    .from("class_subject_teacher")
    .insert([mapping]);

  if (error) throw error;
}

export async function updateMapping(id, mapping) {
  const { error } = await supabase
    .from("class_subject_teacher")
    .update(mapping)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteMapping(id) {
  const { error } = await supabase
    .from("class_subject_teacher")
    .delete()
    .eq("id", id);

  if (error) throw error;
}