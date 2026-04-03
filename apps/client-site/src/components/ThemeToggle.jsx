import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useFeatureFlag } from '../context/FeatureFlagContext';

/**
 * Theme Toggle Button
 * Switches between light and dark themes
 * Gated behind 'theme_toggle' feature flag
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isEnabled = useFeatureFlag('theme_toggle');

  // Don't render if feature flag is disabled
  if (!isEnabled) {
    return null;
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 group"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-5 h-5">
        {/* Sun icon - visible in dark mode */}
        <Sun 
          className={`absolute inset-0 w-5 h-5 text-yellow-500 transition-all duration-300 ${
            theme === 'dark' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 rotate-90 scale-0'
          }`}
        />
        {/* Moon icon - visible in light mode */}
        <Moon 
          className={`absolute inset-0 w-5 h-5 text-gray-700 transition-all duration-300 ${
            theme === 'light' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-0'
          }`}
        />
      </div>
      
      {/* Hover tooltip */}
      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {theme === 'light' ? 'Dark mode' : 'Light mode'}
      </span>
    </button>
  );
}
