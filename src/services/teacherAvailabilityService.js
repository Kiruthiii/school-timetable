import { supabase } from "./supabase";

export async function getTeacherAvailabilityByDate(date) {
  const { data, error } = await supabase
    .from("teacher_availability")
    .select("*")
    .eq("date", date);

  if (error) throw error;
  return data;
}

export async function setTeacherAvailability(teacherId, date, status, session = null) {
  if (status === 'Available') {
    const { error } = await supabase
      .from("teacher_availability")
      .delete()
      .eq("teacher_id", teacherId)
      .eq("date", date);

    if (error) throw error;
  } else {
    // Fetch existing record to get its ID, because upsert by unique constraint sometimes requires specific setup
    const { data: existing } = await supabase
      .from("teacher_availability")
      .select("id")
      .eq("teacher_id", teacherId)
      .eq("date", date)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("teacher_availability")
        .update({ status, session })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("teacher_availability")
        .insert([{ teacher_id: teacherId, date, status, session }]);
      if (error) throw error;
    }
  }
}
