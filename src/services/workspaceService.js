import { supabase } from "./supabase";

/**
 * Retrieves or auto-provisions the database workspace_id for the active authenticated user.
 * PostgreSQL database is the single source of truth.
 */
export async function getOrCreateWorkspaceId() {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session?.user) {
    return null;
  }

  const userId = session.user.id;

  // Query database workspaces table
  const { data: existing, error: queryError } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", userId)
    .maybeSingle();

  if (queryError) {
    console.error("Error querying user workspace:", queryError);
  }

  if (existing?.id) {
    return existing.id;
  }

  // Provision new workspace if not found
  const { data: created, error: createError } = await supabase
    .from("workspaces")
    .insert([{ owner_id: userId, name: "Admin Workspace" }])
    .select("id")
    .single();

  if (createError) {
    console.error("Error creating user workspace:", createError);
    return null;
  }

  return created?.id || null;
}
