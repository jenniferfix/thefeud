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
        (current) =>
          current
            ? mergeGameBoardStateIntoGameInstance(current, nextState)
            : current,
      );
    },
    [instanceId, queryClient],
  );

  const handleConnect = React.useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: getGetGameInstanceQueryKey(instanceId),
    });
  }, [instanceId, queryClient]);

  useGameActionSubscription({
    gameInstanceId: instanceId,
    onConnect: handleConnect,
    onState: updateGameInstanceState,
    soundsEnabled: false,
  });

  const state = React.useMemo(
    () => toGameBoardState(gameInstance),
    [gameInstance],
  );

  const remainingQuestions = React.useMemo(
    () => getRemainingQuestions(gameInstance, state),
    [gameInstance, state],
  );

  const answeredAnswerIds = React.useMemo(
    () => getAnsweredAnswerIds(state),
    [state],
  );

  const isAnswered = React.useCallback(
    (answerId: string) => answeredAnswerIds.has(answerId),
    [answeredAnswerIds],
  );

  const value = React.useMemo<GameControlContext>(
    () => ({
      answeredAnswerIds,
      gameInstance,
      isAnswered,
      remainingQuestions,
      state,
    }),
    [answeredAnswerIds, gameInstance, isAnswered, remainingQuestions, state],
  );

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
