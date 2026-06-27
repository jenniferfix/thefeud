import { useEffect, useState } from 'react';

interface MediaQueryProps {
  query: string;
  defaultValue?: boolean;
}

export const useMediaQuery = ({
  query,
  defaultValue = false,
}: MediaQueryProps): boolean => {
  const [matches, setMatches] = useState<boolean>(() => {
    // Check if window is available (for SSR support)
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return defaultValue;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Create event listener function
    const handleChange = (event: MediaQueryListEvent): void => {
      setMatches(event.matches);
    };

    // Add event listener
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
};
