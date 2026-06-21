import { supabase } from "./supabase";

export async function getTeacherAvailability() {
  const { data, error } = await supabase
    .from("teacher_availability")
    .select(`
      *,
      teachers (
        teacher_name
      )
    `)
    .order("date", { ascending: false });

  if (error) throw error;
  return data;
}

export async function addTeacherAvailability(record) {
  const { error } = await supabase
    .from("teacher_availability")
    .insert([record]);

  if (error) throw error;
}

export async function updateTeacherAvailability(id, record) {
  const { error } = await supabase
    .from("teacher_availability")
    .update(record)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteTeacherAvailability(id) {
  const { error } = await supabase
    .from("teacher_availability")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
