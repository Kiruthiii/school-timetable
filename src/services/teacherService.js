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