/**
 * Analytics Service
 * Sends tracking events to the Supabase Edge Function
 */

// Get the Supabase URL from environment
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANALYTICS_ENDPOINT = `${SUPABASE_URL}/functions/v1/track-analytics`;

// Event queue for batching
let eventQueue = [];
let flushTimeout = null;
const FLUSH_INTERVAL = 2000; // Flush every 2 seconds
const MAX_QUEUE_SIZE = 10; // Or when queue reaches 10 events

/**
 * Detect device type from user agent
 */
const getDeviceType = () => {
  const ua = navigator.userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

/**
 * Get or create session ID
 */
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
    
    // Track session start
    initSession(sessionId);
  }
  return sessionId;
};

/**
 * Check if this is a returning user
 */
const isReturningUser = () => {
  const hasVisited = localStorage.getItem('has_visited');
  if (!hasVisited) {
    localStorage.setItem('has_visited', 'true');
    localStorage.setItem('first_visit', new Date().toISOString());
    return false;
  }
  return true;
};

/**
 * Initialize a new session
 */
const initSession = async (sessionId) => {
  try {
    const sessionData = {
      id: sessionId,
      device_type: getDeviceType(),
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
      landing_page: window.location.pathname,
      is_returning: isReturningUser(),
      page_views: 0,
    };

    await fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session: sessionData }),
    });
  } catch (error) {
    console.warn('Failed to initialize analytics session:', error);
  }
};

/**
 * Queue an event for batched sending
 */
const queueEvent = (eventType, data = {}) => {
  const event = {
    event_type: eventType,
    session_id: getSessionId(),
    page_path: window.location.pathname,
    device_type: getDeviceType(),
    user_agent: navigator.userAgent,
    referrer: document.referrer || null,
    ...data,
  };

  eventQueue.push(event);

  // Flush if queue is full
  if (eventQueue.length >= MAX_QUEUE_SIZE) {
    flushEvents();
  } else if (!flushTimeout) {
    // Schedule flush
    flushTimeout = setTimeout(flushEvents, FLUSH_INTERVAL);
  }
};

/**
 * Flush queued events to the server
 */
const flushEvents = async () => {
  if (flushTimeout) {
    clearTimeout(flushTimeout);
    flushTimeout = null;
  }

  if (eventQueue.length === 0) return;

  const eventsToSend = [...eventQueue];
  eventQueue = [];

  try {
    await fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events: eventsToSend }),
    });
  } catch (error) {
    console.warn('Failed to send analytics events:', error);
    // Re-queue failed events (optional, could cause infinite loop if persistent failure)
    // eventQueue = [...eventsToSend, ...eventQueue];
  }
};

// Flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (eventQueue.length > 0) {
      // Use sendBeacon for reliable delivery on unload
      const data = JSON.stringify({ events: eventQueue });
      navigator.sendBeacon(ANALYTICS_ENDPOINT, data);
    }
  });
}

// ============================================
// Public Tracking Functions
// ============================================

/**
 * Track a page view
 */
export const trackPageView = (pagePath = window.location.pathname) => {
  queueEvent('page_view', { page_path: pagePath });
};

/**
 * Track a product view
 */
export const trackProductView = (productId, categoryId = null, metadata = {}) => {
  queueEvent('product_view', {
    product_id: productId,
    category_id: categoryId,
    metadata,
  });
};

/**
 * Track a category view
 */
export const trackCategoryView = (categoryId, metadata = {}) => {
  queueEvent('category_view', {
    category_id: categoryId,
    metadata,
  });
};

/**
 * Track add to cart
 */
export const trackAddToCart = (productId, quantity = 1, metadata = {}) => {
  queueEvent('add_to_cart', {
    product_id: productId,
    metadata: { ...metadata, quantity },
  });
};

/**
 * Track remove from cart
 */
export const trackRemoveFromCart = (productId, metadata = {}) => {
  queueEvent('remove_from_cart', {
    product_id: productId,
    metadata,
  });
};

/**
 * Track inquiry submission
 */
export const trackInquirySubmit = (productId = null, metadata = {}) => {
  queueEvent('inquiry_submit', {
    product_id: productId,
    metadata,
  });
};

/**
 * Track search
 */
export const trackSearch = (query, resultsCount = 0) => {
  queueEvent('search', {
    metadata: { query, results_count: resultsCount },
  });
};

/**
 * End the current session
 */
export const endSession = async () => {
  const sessionId = sessionStorage.getItem('analytics_session_id');
  if (sessionId) {
    try {
      await fetch(ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session: {
            id: sessionId,
            ended_at: new Date().toISOString(),
          },
        }),
      });
    } catch (error) {
      console.warn('Failed to end analytics session:', error);
    }
  }
};

export default {
  trackPageView,
  trackProductView,
  trackCategoryView,
  trackAddToCart,
  trackRemoveFromCart,
  trackInquirySubmit,
  trackSearch,
  endSession,
  getSessionId,
  getDeviceType,
};
