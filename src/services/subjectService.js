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
  const { error } = await supabase
    .from("subjects")
    .delete()
    .eq("id", id);

  if (error) throw error;
}