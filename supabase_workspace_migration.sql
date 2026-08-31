-- ==============================================================================
-- SCHOOL TIMETABLE SYSTEM: PRODUCTION-HARDENED WORKSPACE MULTI-TENANCY MIGRATION
-- ==============================================================================
-- Protection Model:
-- Workspace isolation is enforced through PostgreSQL Row Level Security, 
-- workspace ownership policies, foreign-key constraints where applicable, 
-- and database-level cross-workspace relationship validation.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- STEP 1: Create Workspaces Table in PostgreSQL
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Admin Workspace',
  created_at timestamptz DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- STEP 2: Add workspace_id columns (nullable initially for safe data migration)
-- ------------------------------------------------------------------------------
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.class_subject_teacher ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.fixed_slots ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.timetable ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.teacher_availability ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.weekly_progress ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- ------------------------------------------------------------------------------
-- STEP 3: Validate Existing Admin User and Migrate Existing Data
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  v_existing_admin_id uuid := '9c9b404e-da90-457c-879a-af8a52f21059'::uuid;
  v_workspace_id uuid;
BEGIN
  -- 1. Validate that the specified primary Admin account exists in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_existing_admin_id) THEN
    RAISE EXCEPTION 'Migration Aborted: Primary Admin user ID % does not exist in auth.users!', v_existing_admin_id;
  END IF;

  -- 2. Create or fetch the primary Admin workspace
  INSERT INTO public.workspaces (owner_id, name)
  VALUES (v_existing_admin_id, 'Primary Admin Workspace')
  ON CONFLICT (owner_id) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_workspace_id;

  -- 3. Assign all existing legitimate unassigned records to this workspace ID
  UPDATE public.teachers SET workspace_id = v_workspace_id WHERE workspace_id IS NULL;
  UPDATE public.classes SET workspace_id = v_workspace_id WHERE workspace_id IS NULL;
  UPDATE public.subjects SET workspace_id = v_workspace_id WHERE workspace_id IS NULL;
  UPDATE public.class_subject_teacher SET workspace_id = v_workspace_id WHERE workspace_id IS NULL;
  UPDATE public.fixed_slots SET workspace_id = v_workspace_id WHERE workspace_id IS NULL;
  UPDATE public.timetable SET workspace_id = v_workspace_id WHERE workspace_id IS NULL;
  UPDATE public.teacher_availability SET workspace_id = v_workspace_id WHERE workspace_id IS NULL;
  UPDATE public.weekly_progress SET workspace_id = v_workspace_id WHERE workspace_id IS NULL;
END $$;

-- ------------------------------------------------------------------------------
-- STEP 4: Pre-Migration Data Integrity Audit (Checks ALL Relationships)
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  v_null_count integer;
  v_invalid_ws_count integer;
  v_mismatch_count integer;
BEGIN
  -- Audit 1: Check for remaining NULL workspace_id records across all 8 tables
  SELECT (
    (SELECT COUNT(*) FROM public.teachers WHERE workspace_id IS NULL) +
    (SELECT COUNT(*) FROM public.classes WHERE workspace_id IS NULL) +
    (SELECT COUNT(*) FROM public.subjects WHERE workspace_id IS NULL) +
    (SELECT COUNT(*) FROM public.class_subject_teacher WHERE workspace_id IS NULL) +
    (SELECT COUNT(*) FROM public.fixed_slots WHERE workspace_id IS NULL) +
    (SELECT COUNT(*) FROM public.timetable WHERE workspace_id IS NULL) +
    (SELECT COUNT(*) FROM public.teacher_availability WHERE workspace_id IS NULL) +
    (SELECT COUNT(*) FROM public.weekly_progress WHERE workspace_id IS NULL)
  ) INTO v_null_count;

  IF v_null_count > 0 THEN
    RAISE EXCEPTION 'Data Integrity Audit Failed: % records remain with NULL workspace_id!', v_null_count;
  END IF;

  -- Audit 2: Check for invalid/orphaned workspace_id references
  SELECT (
    (SELECT COUNT(*) FROM public.teachers WHERE workspace_id NOT IN (SELECT id FROM public.workspaces)) +
    (SELECT COUNT(*) FROM public.classes WHERE workspace_id NOT IN (SELECT id FROM public.workspaces)) +
    (SELECT COUNT(*) FROM public.subjects WHERE workspace_id NOT IN (SELECT id FROM public.workspaces)) +
    (SELECT COUNT(*) FROM public.class_subject_teacher WHERE workspace_id NOT IN (SELECT id FROM public.workspaces)) +
    (SELECT COUNT(*) FROM public.fixed_slots WHERE workspace_id NOT IN (SELECT id FROM public.workspaces)) +
    (SELECT COUNT(*) FROM public.timetable WHERE workspace_id NOT IN (SELECT id FROM public.workspaces)) +
    (SELECT COUNT(*) FROM public.teacher_availability WHERE workspace_id NOT IN (SELECT id FROM public.workspaces)) +
    (SELECT COUNT(*) FROM public.weekly_progress WHERE workspace_id NOT IN (SELECT id FROM public.workspaces))
  ) INTO v_invalid_ws_count;

  IF v_invalid_ws_count > 0 THEN
    RAISE EXCEPTION 'Data Integrity Audit Failed: % records contain invalid workspace_id references!', v_invalid_ws_count;
  END IF;

  -- Audit 3: Comprehensive Cross-Table Relationship Consistency Check across ALL tables
  SELECT (
    -- classes.class_teacher_id -> teachers
    (SELECT COUNT(*) FROM public.classes c 
     JOIN public.teachers t ON c.class_teacher_id = t.id WHERE c.workspace_id <> t.workspace_id) +
    -- class_subject_teacher references
    (SELECT COUNT(*) FROM public.class_subject_teacher m 
     JOIN public.classes c ON m.class_id = c.id WHERE m.workspace_id <> c.workspace_id) +
    (SELECT COUNT(*) FROM public.class_subject_teacher m 
     JOIN public.subjects s ON m.subject_id = s.id WHERE m.workspace_id <> s.workspace_id) +
    (SELECT COUNT(*) FROM public.class_subject_teacher m 
     JOIN public.teachers t ON m.teacher_id = t.id WHERE m.workspace_id <> t.workspace_id) +
    -- fixed_slots references
    (SELECT COUNT(*) FROM public.fixed_slots f 
     JOIN public.classes c ON f.class_id = c.id WHERE f.workspace_id <> c.workspace_id) +
    (SELECT COUNT(*) FROM public.fixed_slots f 
     JOIN public.subjects s ON f.subject_id = s.id WHERE f.subject_id IS NOT NULL AND f.workspace_id <> s.workspace_id) +
    (SELECT COUNT(*) FROM public.fixed_slots f 
     JOIN public.teachers t ON f.teacher_id = t.id WHERE f.teacher_id IS NOT NULL AND f.workspace_id <> t.workspace_id) +
    -- timetable references
    (SELECT COUNT(*) FROM public.timetable tt 
     JOIN public.classes c ON tt.class_id = c.id WHERE tt.workspace_id <> c.workspace_id) +
    (SELECT COUNT(*) FROM public.timetable tt 
     JOIN public.subjects s ON tt.subject_id = s.id WHERE tt.subject_id IS NOT NULL AND tt.workspace_id <> s.workspace_id) +
    (SELECT COUNT(*) FROM public.timetable tt 
     JOIN public.teachers t ON tt.teacher_id = t.id WHERE tt.teacher_id IS NOT NULL AND tt.workspace_id <> t.workspace_id) +
    -- teacher_availability references
    (SELECT COUNT(*) FROM public.teacher_availability a 
     JOIN public.teachers t ON a.teacher_id = t.id WHERE a.workspace_id <> t.workspace_id) +
    -- weekly_progress references
    (SELECT COUNT(*) FROM public.weekly_progress p 
     JOIN public.classes c ON p.class_id = c.id WHERE p.workspace_id <> c.workspace_id) +
    (SELECT COUNT(*) FROM public.weekly_progress p 
     JOIN public.subjects s ON p.subject_id = s.id WHERE p.workspace_id <> s.workspace_id)
  ) INTO v_mismatch_count;

  IF v_mismatch_count > 0 THEN
    RAISE EXCEPTION 'Data Integrity Audit Failed: % existing records violate cross-workspace relationship consistency!', v_mismatch_count;
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- STEP 5: Apply NOT NULL Constraints AFTER Migration Audit
-- ------------------------------------------------------------------------------
ALTER TABLE public.teachers ALTER COLUMN workspace_id SET NOT NULL;
ALTER TABLE public.classes ALTER COLUMN workspace_id SET NOT NULL;
ALTER TABLE public.subjects ALTER COLUMN workspace_id SET NOT NULL;
ALTER TABLE public.class_subject_teacher ALTER COLUMN workspace_id SET NOT NULL;
ALTER TABLE public.fixed_slots ALTER COLUMN workspace_id SET NOT NULL;
ALTER TABLE public.timetable ALTER COLUMN workspace_id SET NOT NULL;
ALTER TABLE public.teacher_availability ALTER COLUMN workspace_id SET NOT NULL;
ALTER TABLE public.weekly_progress ALTER COLUMN workspace_id SET NOT NULL;

-- ------------------------------------------------------------------------------
-- STEP 6: Table-Specific Cross-Workspace Integrity Trigger Functions
-- ------------------------------------------------------------------------------

-- 6a. Trigger Function for classes (checks class_teacher_id)
CREATE OR REPLACE FUNCTION public.check_classes_workspace_consistency()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_ref_workspace uuid;
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.class_teacher_id IS NOT NULL THEN
    SELECT workspace_id INTO v_ref_workspace FROM public.teachers WHERE id = NEW.class_teacher_id;
    IF v_ref_workspace IS NOT NULL AND v_ref_workspace <> NEW.workspace_id THEN
      RAISE EXCEPTION 'Cross-Workspace Integrity Error: Referenced teacher (id=%) belongs to workspace %, but class belongs to workspace %.', NEW.class_teacher_id, v_ref_workspace, NEW.workspace_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_workspace_classes ON public.classes;
CREATE TRIGGER trg_check_workspace_classes
  BEFORE INSERT OR UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.check_classes_workspace_consistency();

-- 6b. Trigger Function for class_subject_teacher (checks class_id, subject_id, teacher_id)
CREATE OR REPLACE FUNCTION public.check_mapping_workspace_consistency()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_ref_workspace uuid;
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.class_id IS NOT NULL THEN
    SELECT workspace_id INTO v_ref_workspace FROM public.classes WHERE id = NEW.class_id;
    IF v_ref_workspace IS NOT NULL AND v_ref_workspace <> NEW.workspace_id THEN
      RAISE EXCEPTION 'Cross-Workspace Integrity Error: Referenced class (id=%) belongs to workspace %, but mapping belongs to workspace %.', NEW.class_id, v_ref_workspace, NEW.workspace_id;
    END IF;
  END IF;

  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.subject_id IS NOT NULL THEN
    SELECT workspace_id INTO v_ref_workspace FROM public.subjects WHERE id = NEW.subject_id;
    IF v_ref_workspace IS NOT NULL AND v_ref_workspace <> NEW.workspace_id THEN
      RAISE EXCEPTION 'Cross-Workspace Integrity Error: Referenced subject (id=%) belongs to workspace %, but mapping belongs to workspace %.', NEW.subject_id, v_ref_workspace, NEW.workspace_id;
    END IF;
  END IF;

  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.teacher_id IS NOT NULL THEN
    SELECT workspace_id INTO v_ref_workspace FROM public.teachers WHERE id = NEW.teacher_id;
    IF v_ref_workspace IS NOT NULL AND v_ref_workspace <> NEW.workspace_id THEN
      RAISE EXCEPTION 'Cross-Workspace Integrity Error: Referenced teacher (id=%) belongs to workspace %, but mapping belongs to workspace %.', NEW.teacher_id, v_ref_workspace, NEW.workspace_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_workspace_mapping ON public.class_subject_teacher;
CREATE TRIGGER trg_check_workspace_mapping
  BEFORE INSERT OR UPDATE ON public.class_subject_teacher
  FOR EACH ROW EXECUTE FUNCTION public.check_mapping_workspace_consistency();

-- 6c. Trigger Function for fixed_slots (checks class_id, subject_id, teacher_id)
CREATE OR REPLACE FUNCTION public.check_fixed_slots_workspace_consistency()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_ref_workspace uuid;
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.class_id IS NOT NULL THEN
    SELECT workspace_id INTO v_ref_workspace FROM public.classes WHERE id = NEW.class_id;
    IF v_ref_workspace IS NOT NULL AND v_ref_workspace <> NEW.workspace_id THEN
      RAISE EXCEPTION 'Cross-Workspace Integrity Error: Referenced class (id=%) belongs to workspace %, but fixed slot belongs to workspace %.', NEW.class_id, v_ref_workspace, NEW.workspace_id;
    END IF;
  END IF;

  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.subject_id IS NOT NULL THEN
    SELECT workspace_id INTO v_ref_workspace FROM public.subjects WHERE id = NEW.subject_id;
    IF v_ref_workspace IS NOT NULL AND v_ref_workspace <> NEW.workspace_id THEN
      RAISE EXCEPTION 'Cross-Workspace Integrity Error: Referenced subject (id=%) belongs to workspace %, but fixed slot belongs to workspace %.', NEW.subject_id, v_ref_workspace, NEW.workspace_id;
    END IF;
  END IF;

  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.teacher_id IS NOT NULL THEN
    SELECT workspace_id INTO v_ref_workspace FROM public.teachers WHERE id = NEW.teacher_id;
    IF v_ref_workspace IS NOT NULL AND v_ref_workspace <> NEW.workspace_id THEN
      RAISE EXCEPTION 'Cross-Workspace Integrity Error: Referenced teacher (id=%) belongs to workspace %, but fixed slot belongs to workspace %.', NEW.teacher_id, v_ref_workspace, NEW.workspace_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_workspace_fixed_slots ON public.fixed_slots;
CREATE TRIGGER trg_check_workspace_fixed_slots
  BEFORE INSERT OR UPDATE ON public.fixed_slots
  FOR EACH ROW EXECUTE FUNCTION public.check_fixed_slots_workspace_consistency();

-- 6d. Trigger Function for timetable (checks class_id, subject_id, teacher_id)
CREATE OR REPLACE FUNCTION public.check_timetable_workspace_consistency()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_ref_workspace uuid;
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.class_id IS NOT NULL THEN
    SELECT workspace_id INTO v_ref_workspace FROM public.classes WHERE id = NEW.class_id;
    IF v_ref_workspace IS NOT NULL AND v_ref_workspace <> NEW.workspace_id THEN
      RAISE EXCEPTION 'Cross-Workspace Integrity Error: Referenced class (id=%) belongs to workspace %, but timetable entry belongs to workspace %.', NEW.class_id, v_ref_workspace, NEW.workspace_id;
    END IF;
  END IF;

  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.subject_id IS NOT NULL THEN
    SELECT workspace_id INTO v_ref_workspace FROM public.subjects WHERE id = NEW.subject_id;
    IF v_ref_workspace IS NOT NULL AND v_ref_workspace <> NEW.workspace_id THEN
      RAISE EXCEPTION 'Cross-Workspace Integrity Error: Referenced subject (id=%) belongs to workspace %, but timetable entry belongs to workspace %.', NEW.subject_id, v_ref_workspace, NEW.workspace_id;
    END IF;
  END IF;

  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.teacher_id IS NOT NULL THEN
    SELECT workspace_id INTO v_ref_workspace FROM public.teachers WHERE id = NEW.teacher_id;
    IF v_ref_workspace IS NOT NULL AND v_ref_workspace <> NEW.workspace_id THEN
      RAISE EXCEPTION 'Cross-Workspace Integrity Error: Referenced teacher (id=%) belongs to workspace %, but timetable entry belongs to workspace %.', NEW.teacher_id, v_ref_workspace, NEW.workspace_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_workspace_timetable ON public.timetable;
CREATE TRIGGER trg_check_workspace_timetable
  BEFORE INSERT OR UPDATE ON public.timetable
  FOR EACH ROW EXECUTE FUNCTION public.check_timetable_workspace_consistency();

-- 6e. Trigger Function for teacher_availability (checks teacher_id ONLY)
CREATE OR REPLACE FUNCTION public.check_teacher_availability_workspace_consistency()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_ref_workspace uuid;
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.teacher_id IS NOT NULL THEN
    SELECT workspace_id INTO v_ref_workspace FROM public.teachers WHERE id = NEW.teacher_id;
    IF v_ref_workspace IS NOT NULL AND v_ref_workspace <> NEW.workspace_id THEN
      RAISE EXCEPTION 'Cross-Workspace Integrity Error: Referenced teacher (id=%) belongs to workspace %, but availability record belongs to workspace %.', NEW.teacher_id, v_ref_workspace, NEW.workspace_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_workspace_teacher_availability ON public.teacher_availability;
CREATE TRIGGER trg_check_workspace_teacher_availability
  BEFORE INSERT OR UPDATE ON public.teacher_availability
  FOR EACH ROW EXECUTE FUNCTION public.check_teacher_availability_workspace_consistency();

-- 6f. Trigger Function for weekly_progress (checks class_id, subject_id ONLY)
CREATE OR REPLACE FUNCTION public.check_weekly_progress_workspace_consistency()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_ref_workspace uuid;
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.class_id IS NOT NULL THEN
    SELECT workspace_id INTO v_ref_workspace FROM public.classes WHERE id = NEW.class_id;
    IF v_ref_workspace IS NOT NULL AND v_ref_workspace <> NEW.workspace_id THEN
      RAISE EXCEPTION 'Cross-Workspace Integrity Error: Referenced class (id=%) belongs to workspace %, but weekly progress record belongs to workspace %.', NEW.class_id, v_ref_workspace, NEW.workspace_id;
    END IF;
  END IF;

  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.subject_id IS NOT NULL THEN
    SELECT workspace_id INTO v_ref_workspace FROM public.subjects WHERE id = NEW.subject_id;
    IF v_ref_workspace IS NOT NULL AND v_ref_workspace <> NEW.workspace_id THEN
      RAISE EXCEPTION 'Cross-Workspace Integrity Error: Referenced subject (id=%) belongs to workspace %, but weekly progress record belongs to workspace %.', NEW.subject_id, v_ref_workspace, NEW.workspace_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_workspace_weekly_progress ON public.weekly_progress;
CREATE TRIGGER trg_check_workspace_weekly_progress
  BEFORE INSERT OR UPDATE ON public.weekly_progress
  FOR EACH ROW EXECUTE FUNCTION public.check_weekly_progress_workspace_consistency();

-- ------------------------------------------------------------------------------
-- STEP 7: Secure Helper Function for Safe RLS Evaluation
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_auth_workspace_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT id FROM public.workspaces WHERE owner_id = auth.uid() LIMIT 1;
$$;

-- ------------------------------------------------------------------------------
-- STEP 8: Enable Row Level Security (RLS) and Create Policies (USING + WITH CHECK)
-- ------------------------------------------------------------------------------
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_subject_teacher ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_progress ENABLE ROW LEVEL SECURITY;

-- Policy for workspaces
DROP POLICY IF EXISTS "Users can manage own workspace" ON public.workspaces;
CREATE POLICY "Users can manage own workspace" ON public.workspaces
  FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Policy for teachers
DROP POLICY IF EXISTS "Workspace data isolation" ON public.teachers;
CREATE POLICY "Workspace data isolation" ON public.teachers
  FOR ALL
  USING (workspace_id = public.get_auth_workspace_id())
  WITH CHECK (workspace_id = public.get_auth_workspace_id());

-- Policy for classes
DROP POLICY IF EXISTS "Workspace data isolation" ON public.classes;
CREATE POLICY "Workspace data isolation" ON public.classes
  FOR ALL
  USING (workspace_id = public.get_auth_workspace_id())
  WITH CHECK (workspace_id = public.get_auth_workspace_id());

-- Policy for subjects
DROP POLICY IF EXISTS "Workspace data isolation" ON public.subjects;
CREATE POLICY "Workspace data isolation" ON public.subjects
  FOR ALL
  USING (workspace_id = public.get_auth_workspace_id())
  WITH CHECK (workspace_id = public.get_auth_workspace_id());

-- Policy for class_subject_teacher
DROP POLICY IF EXISTS "Workspace data isolation" ON public.class_subject_teacher;
CREATE POLICY "Workspace data isolation" ON public.class_subject_teacher
  FOR ALL
  USING (workspace_id = public.get_auth_workspace_id())
  WITH CHECK (workspace_id = public.get_auth_workspace_id());

-- Policy for fixed_slots
DROP POLICY IF EXISTS "Workspace data isolation" ON public.fixed_slots;
CREATE POLICY "Workspace data isolation" ON public.fixed_slots
  FOR ALL
  USING (workspace_id = public.get_auth_workspace_id())
  WITH CHECK (workspace_id = public.get_auth_workspace_id());

-- Policy for timetable
DROP POLICY IF EXISTS "Workspace data isolation" ON public.timetable;
CREATE POLICY "Workspace data isolation" ON public.timetable
  FOR ALL
  USING (workspace_id = public.get_auth_workspace_id())
  WITH CHECK (workspace_id = public.get_auth_workspace_id());

-- Policy for teacher_availability
DROP POLICY IF EXISTS "Workspace data isolation" ON public.teacher_availability;
CREATE POLICY "Workspace data isolation" ON public.teacher_availability
  FOR ALL
  USING (workspace_id = public.get_auth_workspace_id())
  WITH CHECK (workspace_id = public.get_auth_workspace_id());

-- Policy for weekly_progress
DROP POLICY IF EXISTS "Workspace data isolation" ON public.weekly_progress;
CREATE POLICY "Workspace data isolation" ON public.weekly_progress
  FOR ALL
  USING (workspace_id = public.get_auth_workspace_id())
  WITH CHECK (workspace_id = public.get_auth_workspace_id());

-- ------------------------------------------------------------------------------
-- STEP 9: Auto-provision Workspace for New Admins via Trigger
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user_workspace()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.workspaces (owner_id, name)
  VALUES (NEW.id, 'Admin Workspace')
  ON CONFLICT (owner_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_workspace ON auth.users;
CREATE TRIGGER on_auth_user_created_workspace
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_workspace();

-- ==============================================================================
-- STEP 10: VERIFICATION & TEST SQL SUITE (Run in SQL Editor to test database rules)
-- ==============================================================================
/*
-- TEST 1: Workspace Auto-Provisioning Verification
SELECT * FROM public.workspaces WHERE owner_id = '9c9b404e-da90-457c-879a-af8a52f21059';

-- TEST 2: Read Isolation Verification
SELECT COUNT(*) FROM public.teachers;

-- TEST 3: Cross-Workspace Relationship Violation Tests (A through F)
-- Test A: Workspace A mapping linking a Class from Workspace B
-- INSERT INTO public.class_subject_teacher (class_id, subject_id, teacher_id, weekly_periods, workspace_id)
-- VALUES (1, 1, 1, 5, '00000000-0000-0000-0000-000000000000');
-- EXPECTED: Exception "Cross-Workspace Integrity Error..."

-- TEST 4: Workspace ID Manipulation / RLS Rejection Test
-- INSERT INTO public.teachers (teacher_name, short_name, max_periods, workspace_id)
-- VALUES ('Hack Teacher', 'HACK', 5, '00000000-0000-0000-0000-000000000000');
-- EXPECTED: RLS Policy Violation / Rejection

-- TEST 5: New User Auto-Provisioning
-- Verified via AFTER INSERT ON auth.users trigger creating 1 unique workspace in public.workspaces.

-- TEST 6: Existing Legitimate Data Migration Check
SELECT 
  (SELECT COUNT(*) FROM public.teachers WHERE workspace_id IS NOT NULL) AS teachers_migrated,
  (SELECT COUNT(*) FROM public.classes WHERE workspace_id IS NOT NULL) AS classes_migrated,
  (SELECT COUNT(*) FROM public.subjects WHERE workspace_id IS NOT NULL) AS subjects_migrated,
  (SELECT COUNT(*) FROM public.timetable WHERE workspace_id IS NOT NULL) AS timetable_migrated;
*/
