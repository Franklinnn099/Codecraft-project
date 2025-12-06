// Utility functions for handling loading states and network resilience

export const createTimeoutPromise = (name, timeoutMs = 15000) =>
  new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error(`${name} timeout after ${timeoutMs}ms`)),
      timeoutMs
    )
  );

export const withTimeout = async (promise, name, timeoutMs = 15000) => {
  try {
    return await Promise.race([promise, createTimeoutPromise(name, timeoutMs)]);
  } catch (error) {
    console.error(`${name} failed:`, error);
    throw error;
  }
};

export const withRetry = async (fn, retries = 2, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
    }
  }
};

export const safeSupabaseQuery = async (
  queryFn,
  fallbackData = [],
  options = {}
) => {
  const {
    timeout = 10000,
    retries = 1,
    name = "Supabase query",
    onError = null,
  } = options;

  try {
    const result = await withRetry(
      () => withTimeout(queryFn(), name, timeout),
      retries
    );

    if (result?.error) {
      console.error(`${name} error:`, result.error);
      if (onError) onError(result.error);
      return { data: fallbackData, error: result.error };
    }

    return result;
  } catch (error) {
    console.error(`${name} failed completely:`, error);
    if (onError) onError(error);
    return { data: fallbackData, error };
  }
};

// Cache management with expiration
class DataCache {
  constructor() {
    this.cache = new Map();
    this.expiration = new Map();
  }

  set(key, data, ttlMs = 5 * 60 * 1000) {
    // 5 minutes default
    this.cache.set(key, data);
    this.expiration.set(key, Date.now() + ttlMs);
  }

  get(key) {
    if (!this.cache.has(key)) return null;

    const expireTime = this.expiration.get(key);
    if (Date.now() > expireTime) {
      this.cache.delete(key);
      this.expiration.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  clear() {
    this.cache.clear();
    this.expiration.clear();
  }

  has(key) {
    return this.get(key) !== null;
  }
}

export const globalCache = new DataCache();

// Network status monitoring
export const isOnline = () => navigator.onLine;

export const waitForOnline = () => {
  return new Promise((resolve) => {
    if (isOnline()) {
      resolve();
      return;
    }

    const handleOnline = () => {
      window.removeEventListener("online", handleOnline);
      resolve();
    };

    window.addEventListener("online", handleOnline);
  });
};

// Loading state manager for components
export class LoadingManager {
  constructor() {
    this.loadingStates = new Map();
    this.subscribers = new Set();
  }

  setLoading(key, isLoading) {
    this.loadingStates.set(key, isLoading);
    this.notifySubscribers();
  }

  isLoading(key) {
    return this.loadingStates.get(key) || false;
  }

  isAnyLoading() {
    return Array.from(this.loadingStates.values()).some(Boolean);
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers() {
    this.subscribers.forEach((callback) => callback());
  }

  clear() {
    this.loadingStates.clear();
    this.notifySubscribers();
  }
}

export const globalLoadingManager = new LoadingManager();
