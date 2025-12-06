-- Reset RLS policies for admin_users to ensure no interference
DROP POLICY IF EXISTS "Authenticated can read admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admin can insert admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admin can update admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admin can delete admin_users" ON public.admin_users;

-- Re-enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Allow ANY authenticated user to read admin_users (needed for login check)
CREATE POLICY "Authenticated can read admin_users"
    ON public.admin_users
    FOR SELECT
    TO authenticated
    USING (true);

-- Super admin policies
CREATE POLICY "Super admin can insert admin_users"
    ON public.admin_users
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE email = auth.jwt()->>'email'
            AND role = 'super_admin'
            AND is_active = TRUE
        )
    );

CREATE POLICY "Super admin can update admin_users"
    ON public.admin_users
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE email = auth.jwt()->>'email'
            AND role = 'super_admin'
            AND is_active = TRUE
        )
    );

CREATE POLICY "Super admin can delete admin_users"
    ON public.admin_users
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE email = auth.jwt()->>'email'
            AND role = 'super_admin'
            AND is_active = TRUE
        )
    );
