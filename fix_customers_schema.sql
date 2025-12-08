-- 1. Relax Constraints on Customers Table
-- run this to fix any "null value in column" errors during signup
ALTER TABLE public.customers ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE public.customers ALTER COLUMN location DROP NOT NULL;
ALTER TABLE public.customers ALTER COLUMN orders SET DEFAULT 0;
ALTER TABLE public.customers ALTER COLUMN spent SET DEFAULT 0;

-- 2. Ensure the Signup Trigger Function is Correct
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    -- Logic: Emails with 'expertoffice' go to USERS (Admins), others to CUSTOMERS
    IF NEW.email LIKE '%@expertoffice.%' OR NEW.email IN ('admin@example.com', 'manager@example.com') THEN
        INSERT INTO public.users (id, name, email, role)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
            NEW.email,
            'admin'
        );
    ELSE
        -- Everyone else is a Customer
        INSERT INTO public.customers (id, name, email)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
            NEW.email
        );
    END IF;
    RETURN NEW;
END;
$$ language plpgsql security definer;

-- 3. Re-attach the Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Verify Permissions
GRANT SELECT, INSERT, UPDATE ON public.customers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.customers TO service_role;
