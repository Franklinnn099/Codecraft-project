/**
 * Feature Flags Configuration
 * 
 * Feature flags allow you to toggle features on/off without deploying code.
 * 
 * Usage:
 *   import { isFeatureEnabled } from './featureFlags';
 *   if (isFeatureEnabled('theme_toggle')) { ... }
 * 
 * Override in browser console:
 *   localStorage.setItem('ff_theme_toggle', 'false');  // Disable
 *   localStorage.setItem('ff_theme_toggle', 'true');   // Enable
 *   localStorage.removeItem('ff_theme_toggle');        // Use default
 */

// Default feature flag values
const FEATURE_FLAGS = {
  // Theme toggle - allows users to switch between light/dark mode
  theme_toggle: true,
  
  // Add more feature flags here as needed:
  // new_checkout: false,
  // beta_features: false,
};

/**
 * Check if a feature flag is enabled
 * @param {string} flagName - Name of the feature flag
 * @returns {boolean} - Whether the feature is enabled
 */
export function isFeatureEnabled(flagName) {
  // Check for localStorage override first (for testing)
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem(`ff_${flagName}`);
    if (override !== null) {
      return override === 'true';
    }
  }
  
  // Return default value from config
  return FEATURE_FLAGS[flagName] ?? false;
}

/**
 * Get all feature flags with their current values
 * @returns {Object} - Object containing all flags and their values
 */
export function getAllFlags() {
  const flags = {};
  for (const [key, defaultValue] of Object.entries(FEATURE_FLAGS)) {
    flags[key] = isFeatureEnabled(key);
  }
  return flags;
}

/**
 * Set a feature flag override (for testing)
 * @param {string} flagName - Name of the feature flag
 * @param {boolean} value - Whether to enable or disable
 */
export function setFeatureFlag(flagName, value) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`ff_${flagName}`, value.toString());
  }
}

/**
 * Clear a feature flag override (revert to default)
 * @param {string} flagName - Name of the feature flag
 */
export function clearFeatureFlag(flagName) {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`ff_${flagName}`);
  }
}

export default FEATURE_FLAGS;
