import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const applyThemeToDOM = (themeName) => {
  const root = document.documentElement;
  const body = document.body;
  if (themeName === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    if (body) {
      body.classList.add('dark');
      body.classList.remove('light');
    }
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    if (body) {
      body.classList.remove('dark');
      body.classList.add('light');
    }
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('uniskill_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('uniskill_theme', theme);
    } catch (e) {}
    applyThemeToDOM(theme);
  }, [theme]);

  const toggleTheme = () => {
    const isCurrentlyDark = document.documentElement.classList.contains('dark') || theme === 'dark';
    const nextTheme = isCurrentlyDark ? 'light' : 'dark';
    applyThemeToDOM(nextTheme);
    try {
      localStorage.setItem('uniskill_theme', nextTheme);
    } catch (e) {}
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
