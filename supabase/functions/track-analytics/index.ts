import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers for cross-origin requests from client site
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Valid event types
const VALID_EVENT_TYPES = [
  'page_view',
  'product_view',
  'category_view',
  'add_to_cart',
  'remove_from_cart',
  'inquiry_submit',
  'search',
  'session_start',
  'session_end',
];

// Valid device types
const VALID_DEVICE_TYPES = ['desktop', 'mobile', 'tablet'];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for bypassing RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const { events, session } = body;

    // Validate request
    if (!events && !session) {
      return new Response(
        JSON.stringify({ error: 'Either events or session data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = { events: null, session: null };

    // Process session data (start or update)
    if (session) {
      const { id, device_type, user_agent, referrer, landing_page, ended_at, page_views, is_returning } = session;

      if (!id) {
        return new Response(
          JSON.stringify({ error: 'Session ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate device type
      if (device_type && !VALID_DEVICE_TYPES.includes(device_type)) {
        return new Response(
          JSON.stringify({ error: `Invalid device_type. Must be one of: ${VALID_DEVICE_TYPES.join(', ')}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Upsert session
      const { data: sessionData, error: sessionError } = await supabaseClient
        .from('analytics_sessions')
        .upsert({
          id,
          device_type: device_type || 'desktop',
          user_agent: user_agent?.substring(0, 500), // Limit length
          referrer: referrer?.substring(0, 500),
          landing_page: landing_page?.substring(0, 500),
          ended_at,
          page_views,
          is_returning: is_returning || false,
        }, { onConflict: 'id' })
        .select();

      if (sessionError) {
        console.error('Session upsert error:', sessionError);
      }
      results.session = sessionData;
    }

    // Process events
    if (events && Array.isArray(events) && events.length > 0) {
      // Validate and sanitize events
      const validatedEvents = events
        .filter((event) => {
          if (!event.event_type || !VALID_EVENT_TYPES.includes(event.event_type)) {
            console.warn('Invalid event type:', event.event_type);
            return false;
          }
          if (!event.session_id) {
            console.warn('Missing session_id');
            return false;
          }
          return true;
        })
        .map((event) => ({
          event_type: event.event_type,
          session_id: event.session_id,
          page_path: event.page_path?.substring(0, 500),
          product_id: event.product_id || null,
          category_id: event.category_id || null,
          device_type: VALID_DEVICE_TYPES.includes(event.device_type) ? event.device_type : 'desktop',
          user_agent: event.user_agent?.substring(0, 500),
          referrer: event.referrer?.substring(0, 500),
          metadata: event.metadata || {},
        }));

      if (validatedEvents.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No valid events provided' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Insert events
      const { data: eventData, error: eventError } = await supabaseClient
        .from('analytics_events')
        .insert(validatedEvents)
        .select();

      if (eventError) {
        console.error('Event insert error:', eventError);
        return new Response(
          JSON.stringify({ error: eventError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      results.events = eventData;

      // Update session page view count
      if (validatedEvents.some((e) => e.event_type === 'page_view')) {
        const sessionId = validatedEvents[0].session_id;
        const pageViewCount = validatedEvents.filter((e) => e.event_type === 'page_view').length;

        await supabaseClient.rpc('increment_page_views', {
          p_session_id: sessionId,
          p_count: pageViewCount,
        }).catch((err) => console.warn('Could not increment page views:', err));
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: results }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('Track analytics error:', e);
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
