-- Fix role selection: allow authenticated users to insert their own role
-- (required for Google OAuth users on first login)

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Ensure one role row per user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_roles_user_id_unique'
  ) THEN
    ALTER TABLE public.user_roles
      ADD CONSTRAINT user_roles_user_id_unique UNIQUE (user_id);
  END IF;
END $$;

-- Allow users to insert their own role (once; unique constraint enforces single row)
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;
CREATE POLICY "Users can insert their own role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
