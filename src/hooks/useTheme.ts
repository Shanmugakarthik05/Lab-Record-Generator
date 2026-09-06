import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const saved = localStorage.getItem('sk-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;

    // Add the transition class so switches animate smoothly
    root.classList.add('theme-switching');

    // Apply the new theme class
    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    // Persist user preference
    localStorage.setItem('sk-theme', theme);

    // Remove the transition class after the animation completes
    const timer = setTimeout(() => {
      root.classList.remove('theme-switching');
    }, 350);

    return () => clearTimeout(timer);
  }, [theme]);

  // Listen for system preference changes (if user hasn't manually overridden)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem('sk-theme');
      // Only respond to system changes if user hasn't picked manually
      if (!saved) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, toggleTheme, isDark: theme === 'dark' };
}
