import { supabase } from "./supabase";
import { getOrCreateWorkspaceId } from "./workspaceService";

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
  const workspaceId = await getOrCreateWorkspaceId();
  const data = { ...classData };
  if (data.class_teacher_id === "") {
    data.class_teacher_id = null;
  }
  if (workspaceId) {
    data.workspace_id = workspaceId;
  }

  const { error } = await supabase
    .from("classes")
    .insert([data]);

  if (error) throw error;
}

export async function updateClass(id, classData) {
  const data = { ...classData };
  if (data.class_teacher_id === "") {
    data.class_teacher_id = null;
  }

  const { error } = await supabase
    .from("classes")
    .update(data)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteClass(id) {
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