-- ============================================
-- Admin Users Schema Migration
-- ============================================
-- This migration creates the admin_users table for managing
-- dashboard access with role-based permissions.

-- ============================================
-- 1. Admin Users Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
    display_name TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON public.admin_users(role);

-- ============================================
-- 2. RLS Policies
-- ============================================
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read admin_users (to check their own access)
CREATE POLICY "Authenticated can read admin_users"
    ON public.admin_users
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Only super_admin can insert new admin users
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

-- Only super_admin can update admin users
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

-- Only super_admin can delete admin users
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

-- ============================================
-- 3. Insert Super Admin
-- ============================================
-- IMPORTANT: This inserts the super admin. 
-- Make sure this email exists in Supabase Auth first!
INSERT INTO public.admin_users (email, role, display_name, is_active)
VALUES ('bahdrhymez123@gmail.com', 'super_admin', 'Super Admin', TRUE)
ON CONFLICT (email) DO UPDATE SET role = 'super_admin', is_active = TRUE;

-- ============================================
-- 4. Function to check if user is admin
-- ============================================
-- Drop existing functions first to avoid conflicts
DROP FUNCTION IF EXISTS public.is_admin(TEXT);
DROP FUNCTION IF EXISTS public.is_super_admin(TEXT);

CREATE OR REPLACE FUNCTION public.is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE email = user_email
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE email = user_email
        AND role = 'super_admin'
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. Trigger to update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_admin_users_updated_at();

-- Grant necessary permissions
GRANT SELECT ON public.admin_users TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.admin_users TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin TO authenticated;
