import { createContext, useContext, useState, useEffect } from 'react';
import { isFeatureEnabled, getAllFlags } from '../utils/featureFlags';

const FeatureFlagContext = createContext({});

/**
 * Feature Flag Provider
 * Provides feature flag state to the entire app
 */
export function FeatureFlagProvider({ children }) {
  const [flags, setFlags] = useState(() => getAllFlags());

  // Listen for localStorage changes (for real-time testing)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key?.startsWith('ff_')) {
        setFlags(getAllFlags());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <FeatureFlagContext.Provider value={flags}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

/**
 * Hook to check if a feature flag is enabled
 * @param {string} flagName - Name of the feature flag
 * @returns {boolean} - Whether the feature is enabled
 */
export function useFeatureFlag(flagName) {
  const flags = useContext(FeatureFlagContext);
  
  // Fallback to direct check if context not available
  if (Object.keys(flags).length === 0) {
    return isFeatureEnabled(flagName);
  }
  
  return flags[flagName] ?? false;
}

export default FeatureFlagContext;
