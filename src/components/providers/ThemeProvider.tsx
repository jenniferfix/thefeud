import { createContext, memo, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export const ThemeProvider = memo(
  ({
    children,
    defaultTheme = 'system',
    storageKey = 'callcat-theme',
    ...props
  }: ThemeProviderProps) => {
    const [theme, setTheme] = useState<Theme>(() => {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined') {
        return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
      }
      return defaultTheme;
    });

    useEffect(() => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');

      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
          .matches
          ? 'dark'
          : 'light';

        root.classList.add(systemTheme);
        return;
      }

      root.classList.add(theme);
    }, [theme]);

    // Additional useEffect to sync with localStorage after hydration
    useEffect(() => {
      if (typeof window !== 'undefined') {
        const storedTheme = localStorage.getItem(storageKey) as Theme;
        if (storedTheme && storedTheme !== theme) {
          setTheme(storedTheme);
        }
      }
    }, [storageKey, theme]);

    const value = {
      theme,
      setTheme: (theme: Theme) => {
        localStorage.setItem(storageKey, theme);
        setTheme(theme);
      },
    };

    return (
      <ThemeProviderContext.Provider {...props} value={value}>
        {children}
      </ThemeProviderContext.Provider>
    );
  },
);

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
