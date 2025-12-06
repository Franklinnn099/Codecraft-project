import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, X } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setShowBanner(true);
        // Auto-hide after 3 seconds
        setTimeout(() => setShowBanner(false), 3000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  if (!showBanner) return null;

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
        showBanner ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <div
        className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-lg backdrop-blur-md ${
          isOnline
            ? 'bg-green-500/90 text-white'
            : 'bg-gray-900/90 text-white border border-white/10'
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="w-5 h-5" />
            <span className="font-medium">Back online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-5 h-5 animate-pulse" />
            <span className="font-medium">You're offline</span>
            <span className="text-sm text-gray-300">- Some features may be limited</span>
          </>
        )}

        <button
          onClick={() => setShowBanner(false)}
          className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Update Banner Component - shows when new version is available
export function UpdateBanner({ onUpdate, onDismiss }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-4 rounded-2xl shadow-xl">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold mb-1">Update Available</h4>
            <p className="text-sm text-green-100 mb-3">
              A new version is available. Refresh to get the latest features.
            </p>
            <div className="flex gap-2">
              <button
                onClick={onUpdate}
                className="px-4 py-2 bg-white text-green-600 font-medium rounded-lg hover:bg-green-50 transition-colors text-sm"
              >
                Update Now
              </button>
              <button
                onClick={onDismiss}
                className="px-4 py-2 bg-white/20 font-medium rounded-lg hover:bg-white/30 transition-colors text-sm"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
