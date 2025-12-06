// Service Worker Registration Utility
// Handles registration, updates, and offline status

import React from 'react';

const SW_PATH = '/sw.js';

class ServiceWorkerManager {
  constructor() {
    this.registration = null;
    this.isOnline = navigator.onLine;
    this.updateAvailable = false;
    this.listeners = new Set();
  }

  // Initialize service worker
  async init() {
    if (!('serviceWorker' in navigator)) {
      console.log('[SW Manager] Service workers not supported');
      return false;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register(SW_PATH, {
        scope: '/',
      });

      console.log('[SW Manager] Service worker registered:', this.registration.scope);

      // Listen for updates
      this.registration.addEventListener('updatefound', () => {
        this.handleUpdateFound();
      });

      // Listen for controlling service worker changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[SW Manager] Controller changed');
      });

      // Setup online/offline listeners
      this.setupConnectivityListeners();

      // Check for updates periodically (every hour)
      setInterval(() => this.checkForUpdates(), 60 * 60 * 1000);

      return true;
    } catch (error) {
      console.error('[SW Manager] Registration failed:', error);
      return false;
    }
  }

  // Handle service worker update
  handleUpdateFound() {
    const newWorker = this.registration?.installing;
    
    if (!newWorker) return;

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // New update available
        this.updateAvailable = true;
        this.notifyListeners('updateAvailable');
        console.log('[SW Manager] Update available');
      }
    });
  }

  // Check for updates manually
  async checkForUpdates() {
    if (!this.registration) return;

    try {
      await this.registration.update();
      console.log('[SW Manager] Checked for updates');
    } catch (error) {
      console.error('[SW Manager] Update check failed:', error);
    }
  }

  // Apply pending update
  applyUpdate() {
    if (!this.registration?.waiting) return;

    // Tell the waiting service worker to skip waiting
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // Reload once the new service worker takes over
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    }, { once: true });
  }

  // Clear all caches
  async clearCache() {
    if (this.registration?.active) {
      this.registration.active.postMessage({ type: 'CLEAR_CACHE' });
    }

    // Also clear from client side
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
    
    console.log('[SW Manager] Cache cleared');
  }

  // Setup connectivity listeners
  setupConnectivityListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners('online');
      console.log('[SW Manager] Back online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners('offline');
      console.log('[SW Manager] Gone offline');
    });
  }

  // Subscribe to events
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners
  notifyListeners(event, data) {
    this.listeners.forEach((callback) => callback(event, data));
  }

  // Get current status
  getStatus() {
    return {
      supported: 'serviceWorker' in navigator,
      registered: !!this.registration,
      isOnline: this.isOnline,
      updateAvailable: this.updateAvailable,
    };
  }
}

// Create singleton instance
const swManager = new ServiceWorkerManager();

// Register service worker - main export function
export async function registerServiceWorker() {
  if (import.meta.env.PROD) {
    return swManager.init();
  }
  console.log('[SW Manager] Skipping SW registration in development');
  return false;
}

export default swManager;

// React hook for service worker status
export function useServiceWorker() {
  const [status, setStatus] = React.useState(swManager.getStatus());

  React.useEffect(() => {
    const unsubscribe = swManager.subscribe((event) => {
      setStatus(swManager.getStatus());
    });

    return unsubscribe;
  }, []);

  return {
    ...status,
    checkForUpdates: () => swManager.checkForUpdates(),
    applyUpdate: () => swManager.applyUpdate(),
    clearCache: () => swManager.clearCache(),
  };
}
