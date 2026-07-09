import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import type { GameBoardState } from '#/lib/schemas/gameboard';
import type { RedisCodeStorageType } from '#/lib/schemas/joincode';
import { useGameActionSubscription } from './useGameActionSubscription';
import { getJoinCodeGameQueryKey, useGetJoinCodeGame } from './usejoincodes';
import { useStrikeOverlay } from './useStrikeOverlay';

export const useIsolatedViewer = (joinCode: string) => {
  const { data } = useGetJoinCodeGame(joinCode);
  const queryClient = useQueryClient();
  const {
    showStrike: showStrikes,
    showStrikeOverlay,
    hideStrikeOverlay,
  } = useStrikeOverlay();

  const updateQuery = React.useCallback(
    (next: GameBoardState) => {
      queryClient.setQueryData<RedisCodeStorageType | null>(
        getJoinCodeGameQueryKey(joinCode),
        (current) => {
          if (!current) return current;
          return {
            ...current,
            state: next,
          };
        },
      );
    },
    [joinCode, queryClient],
  );

  const handleAction = React.useCallback(
    (type: string) => {
      switch (type) {
        case 'StartQuestion':
          hideStrikeOverlay();
          break;
        case 'Strike':
          showStrikeOverlay();
          break;
      }
    },
    [hideStrikeOverlay, showStrikeOverlay],
  );

  useGameActionSubscription({
    channelId: data?.gameInstanceId,
    onAction: handleAction,
    onState: updateQuery,
    soundsEnabled: true,
  });

  const state = data?.state;

  return {
    gameTitle: state?.gameTitle ?? '',
    leftTeam: state?.leftTeam ?? '',
    rightTeam: state?.rightTeam ?? '',
    rightScore: state?.rightScore ?? 0,
    leftScore: state?.leftScore ?? 0,
    questionText: state?.questionTitle ?? '',
    roundScore: state?.roundScore ?? 0,
    confettiMode: state?.confettiMode ?? 'disabled',
    gameover: state?.gameover ?? false,
    strikes: state?.strikes ?? 0,
    showStrikes,
    answers: state?.answers ?? {},
  };
};
