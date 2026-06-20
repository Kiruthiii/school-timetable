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
  const { error } = await supabase
    .from("classes")
    .delete()
    .eq("id", id);

  if (error) throw error;
}