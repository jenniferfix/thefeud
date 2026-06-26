import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import {
  getAnsweredAnswerIds,
  getRemainingQuestions,
  mergeGameBoardStateIntoGameInstance,
  toGameBoardState,
} from '#/lib/gameboard-state';
import type { GameBoardState } from '#/lib/schemas/gameboard';
import { useGameActionSubscription } from '@/hooks/useGameActionSubscription';
import {
  getGetGameInstanceQueryKey,
  useGetGameInstance,
} from '@/hooks/useinstancequeries';
import type { GameInstance, GameQuestion } from '@/queries/instancequeries';

type GameInstanceRow = NonNullable<GameInstance>;

type GameControlContext = {
  answeredAnswerIds: Set<string>;
  gameInstance: GameInstanceRow;
  isAnswered: (answerId: string) => boolean;
  remainingQuestions: GameQuestion[];
  state: GameBoardState;
};

const GameControlContext = React.createContext<GameControlContext | null>(null);

type GameControlProviderProps = {
  children: React.ReactNode;
  instanceId: string;
};

export function GameControlProvider({
  children,
  instanceId,
}: GameControlProviderProps) {
  const queryClient = useQueryClient();
  const { data: gameInstance } = useGetGameInstance(instanceId);

  const updateGameInstanceState = React.useCallback(
    (nextState: GameBoardState) => {
      queryClient.setQueryData<GameInstance | null>(
        getGetGameInstanceQueryKey(instanceId),
        (current) => {
          if (!current) return current;
          return mergeGameBoardStateIntoGameInstance(current, nextState);
        },
      );
    },
    [instanceId, queryClient],
  );

  useGameActionSubscription({
    channelId: instanceId,
    onState: updateGameInstanceState,
    soundsEnabled: false,
  });

  const state = React.useMemo(() => {
    if (!gameInstance) return null;
    return toGameBoardState(gameInstance);
  }, [gameInstance]);

  const remainingQuestions = React.useMemo(
    () =>
      gameInstance && state ? getRemainingQuestions(gameInstance, state) : [],
    [gameInstance, state],
  );

  const answeredAnswerIds = React.useMemo(
    () => (state ? getAnsweredAnswerIds(state) : new Set<string>()),
    [state],
  );

  const isAnswered = React.useCallback(
    (answerId: string) => answeredAnswerIds.has(answerId),
    [answeredAnswerIds],
  );

  const value = React.useMemo<GameControlContext | null>(() => {
    if (!gameInstance || !state) return null;

    return {
      answeredAnswerIds,
      gameInstance,
      isAnswered,
      remainingQuestions,
      state,
    };
  }, [answeredAnswerIds, gameInstance, isAnswered, remainingQuestions, state]);

  if (!value) {
    throw new Error('Game instance not found');
  }

  return (
    <GameControlContext.Provider value={value}>
      {children}
    </GameControlContext.Provider>
  );
}

export function useGameControlContext() {
  const context = React.useContext(GameControlContext);

  if (!context) {
    throw new Error(
      'useGameControlContext must be used within a GameControlProvider',
    );
  }

  return context;
}
