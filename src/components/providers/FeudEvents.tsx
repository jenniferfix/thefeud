import React from 'react';
import useGameEvents from '@/hooks/useFeudEvents';

type FeudEventsContext = ReturnType<typeof useGameEvents>;

const FeudEventsContext = React.createContext<FeudEventsContext | null>(null);

type FeudEventsProviderProps = {
  children: React.ReactNode;
  instanceId: string;
  sound?: boolean;
};

export function FeudEventsProvider({
  children,
  instanceId,
  sound = false,
}: FeudEventsProviderProps) {
  const feudEvents = useGameEvents({ instanceId, sound });

  return (
    <FeudEventsContext.Provider value={feudEvents}>
      {children}
    </FeudEventsContext.Provider>
  );
}

export function useFeudEventsContext() {
  const context = React.useContext(FeudEventsContext);

  if (!context) {
    throw new Error(
      'useFeudEventsContext must be used within a FeudEventsProvider',
    );
  }

  return context;
}
