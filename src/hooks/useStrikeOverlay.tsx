import React from 'react';

export const useStrikeOverlay = (durationMs = 1500) => {
  const [showStrike, setShowStrike] = React.useState(false);
  const strikeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const hideStrikeOverlay = React.useCallback(() => {
    if (strikeTimerRef.current) {
      clearTimeout(strikeTimerRef.current);
    }

    setShowStrike(false);
    strikeTimerRef.current = null;
  }, []);

  const showStrikeOverlay = React.useCallback(() => {
    if (strikeTimerRef.current) {
      clearTimeout(strikeTimerRef.current);
    }

    setShowStrike(true);
    strikeTimerRef.current = setTimeout(() => {
      setShowStrike(false);
      strikeTimerRef.current = null;
    }, durationMs);
  }, [durationMs]);

  React.useEffect(() => {
    return () => {
      if (strikeTimerRef.current) {
        clearTimeout(strikeTimerRef.current);
      }
    };
  }, []);

  return {
    showStrike,
    showStrikeOverlay,
    hideStrikeOverlay,
  };
};
