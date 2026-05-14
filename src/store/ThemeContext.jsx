import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

const THEME_KEY = 'nexora.theme.v1';
export const THEMES = ['nexora-dark', 'light-clean', 'midnight-blue', 'purple-neon', 'cyberpunk'];

const ThemeContext = createContext(null);

function readTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved && THEMES.includes(saved)) return saved;
  } catch {/* ignore */}
  return 'nexora-dark';
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = useCallback((next) => {
    if (!THEMES.includes(next)) return;
    setThemeState(next);
    try { localStorage.setItem(THEME_KEY, next); } catch {/* ignore */}
  }, []);

  const value = useMemo(() => ({ theme, setTheme, themes: THEMES }), [theme, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
