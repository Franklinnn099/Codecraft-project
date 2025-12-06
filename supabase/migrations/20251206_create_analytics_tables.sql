-- ============================================
-- Real-Time Analytics Schema Migration
-- ============================================
-- This migration creates the tables and views needed for
-- tracking live user behavior from the client site.

-- ============================================
-- 1. Analytics Events Table
-- ============================================
-- Stores raw event data from the client site
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL CHECK (event_type IN (
        'page_view', 
        'product_view', 
        'category_view',
        'add_to_cart', 
        'remove_from_cart',
        'inquiry_submit',
        'search',
        'session_start',
        'session_end'
    )),
    session_id TEXT NOT NULL,
    page_path TEXT,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
    user_agent TEXT,
    referrer TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON public.analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_product_id ON public.analytics_events(product_id);

-- ============================================
-- 2. Analytics Sessions Table
-- ============================================
-- Tracks unique user sessions
CREATE TABLE IF NOT EXISTS public.analytics_sessions (
    id TEXT PRIMARY KEY,
    device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
    user_agent TEXT,
    referrer TEXT,
    landing_page TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    page_views INTEGER DEFAULT 0,
    is_returning BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_started_at ON public.analytics_sessions(started_at DESC);

-- ============================================
-- 3. RLS Policies
-- ============================================
-- Anyone can insert analytics events (for tracking)
-- Only authenticated users can read (for admin dashboard)

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;

-- Allow public inserts for tracking
CREATE POLICY "Allow public insert on analytics_events" 
    ON public.analytics_events 
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow public insert on analytics_sessions" 
    ON public.analytics_sessions 
    FOR INSERT 
    WITH CHECK (true);

-- Allow authenticated users to read
CREATE POLICY "Allow authenticated read on analytics_events" 
    ON public.analytics_events 
    FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read on analytics_sessions" 
    ON public.analytics_sessions 
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Allow public update on sessions (for ending sessions)
CREATE POLICY "Allow public update on analytics_sessions" 
    ON public.analytics_sessions 
    FOR UPDATE 
    USING (true);

-- ============================================
-- 4. SQL Views for Aggregated Analytics
-- ============================================

-- Daily Analytics View
CREATE OR REPLACE VIEW public.v_daily_analytics AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) FILTER (WHERE event_type = 'page_view') as page_views,
    COUNT(*) FILTER (WHERE event_type = 'product_view') as product_views,
    COUNT(*) FILTER (WHERE event_type = 'add_to_cart') as cart_adds,
    COUNT(*) FILTER (WHERE event_type = 'inquiry_submit') as inquiries,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(*) FILTER (WHERE device_type = 'desktop') as desktop_views,
    COUNT(*) FILTER (WHERE device_type = 'mobile') as mobile_views,
    COUNT(*) FILTER (WHERE device_type = 'tablet') as tablet_views
FROM public.analytics_events
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Monthly Analytics View
CREATE OR REPLACE VIEW public.v_monthly_analytics AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    EXTRACT(YEAR FROM created_at)::INTEGER as year,
    EXTRACT(MONTH FROM created_at)::INTEGER as month_num,
    COUNT(*) FILTER (WHERE event_type = 'page_view') as page_views,
    COUNT(*) FILTER (WHERE event_type = 'product_view') as product_views,
    COUNT(*) FILTER (WHERE event_type = 'add_to_cart') as cart_adds,
    COUNT(*) FILTER (WHERE event_type = 'inquiry_submit') as inquiries,
    COUNT(DISTINCT session_id) as unique_sessions
FROM public.analytics_events
WHERE created_at >= NOW() - INTERVAL '24 months'
GROUP BY DATE_TRUNC('month', created_at), EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at)
ORDER BY month DESC;

-- Top Products View (by views + cart adds + inquiries)
CREATE OR REPLACE VIEW public.v_top_products AS
SELECT 
    e.product_id,
    p.name as product_name,
    p.image_url,
    p.price,
    COUNT(*) FILTER (WHERE e.event_type = 'product_view') as view_count,
    COUNT(*) FILTER (WHERE e.event_type = 'add_to_cart') as cart_count,
    COUNT(*) FILTER (WHERE e.event_type = 'inquiry_submit') as inquiry_count,
    -- Performance score: views + (cart*3) + (inquiry*5)
    (COUNT(*) FILTER (WHERE e.event_type = 'product_view') +
     COUNT(*) FILTER (WHERE e.event_type = 'add_to_cart') * 3 +
     COUNT(*) FILTER (WHERE e.event_type = 'inquiry_submit') * 5) as performance_score
FROM public.analytics_events e
LEFT JOIN public.products p ON e.product_id = p.id
WHERE e.product_id IS NOT NULL
  AND e.created_at >= NOW() - INTERVAL '30 days'
GROUP BY e.product_id, p.name, p.image_url, p.price
ORDER BY performance_score DESC
LIMIT 20;

-- Device Breakdown View
CREATE OR REPLACE VIEW public.v_device_breakdown AS
SELECT 
    DATE(created_at) as date,
    device_type,
    COUNT(*) as event_count,
    COUNT(DISTINCT session_id) as unique_sessions
FROM public.analytics_events
WHERE created_at >= NOW() - INTERVAL '30 days'
  AND device_type IS NOT NULL
GROUP BY DATE(created_at), device_type
ORDER BY date DESC, device_type;

-- Session Statistics View
CREATE OR REPLACE VIEW public.v_session_stats AS
SELECT 
    DATE(started_at) as date,
    COUNT(*) as total_sessions,
    COUNT(*) FILTER (WHERE is_returning = true) as returning_sessions,
    AVG(page_views) as avg_page_views,
    AVG(EXTRACT(EPOCH FROM (ended_at - started_at))) as avg_session_duration_seconds
FROM public.analytics_sessions
WHERE started_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(started_at)
ORDER BY date DESC;

-- Grant access to views for authenticated users
GRANT SELECT ON public.v_daily_analytics TO authenticated;
GRANT SELECT ON public.v_monthly_analytics TO authenticated;
GRANT SELECT ON public.v_top_products TO authenticated;
GRANT SELECT ON public.v_device_breakdown TO authenticated;
GRANT SELECT ON public.v_session_stats TO authenticated;

-- Grant insert access for public (for tracking)
GRANT INSERT ON public.analytics_events TO anon;
GRANT INSERT, UPDATE ON public.analytics_sessions TO anon;

-- ============================================
-- 5. Function to calculate bounce rate
-- ============================================
CREATE OR REPLACE FUNCTION public.get_bounce_rate(start_date DATE, end_date DATE)
RETURNS NUMERIC AS $$
DECLARE
    total_sessions INTEGER;
    single_page_sessions INTEGER;
BEGIN
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE page_views <= 1)
    INTO total_sessions, single_page_sessions
    FROM public.analytics_sessions
    WHERE DATE(started_at) BETWEEN start_date AND end_date;
    
    IF total_sessions = 0 THEN
        RETURN 0;
    END IF;
    
    RETURN ROUND((single_page_sessions::NUMERIC / total_sessions::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
