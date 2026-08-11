import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/**
 * ThemeToggle
 * Animated sun/moon button that switches between dark and light mode.
 */
const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`p-2 rounded-xl transition-all duration-200
        text-surface-400 hover:text-surface-200
        hover:bg-surface-800 dark:hover:bg-surface-700
        focus-visible:ring-2 focus-visible:ring-primary-500
        ${className}`}
    >
      <span className="block transition-transform duration-300" style={{ transform: isDark ? 'rotate(0deg)' : 'rotate(180deg)' }}>
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </span>
    </button>
  );
};

export default ThemeToggle;
