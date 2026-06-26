import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { sentEvent, soundEvent } from '#/lib/schemas/events';
import type { GameBoardState } from '#/lib/schemas/gameboard';
import type { RedisCodeStorageType } from '#/lib/schemas/joincode';
import { useGameSounds } from './useGameSounds';
import { getJoinCodeGameQueryKey, useGetJoinCodeGame } from './usejoincodes';
import useSupabase from './useSupabase';

export const useIsolatedViewer = (joinCode: string) => {
  const { data } = useGetJoinCodeGame(joinCode);
  const queryClient = useQueryClient();
  const supabase = useSupabase();
  const { playSound, playActionSound } = useGameSounds({ enabled: true });

  const [showStrikes, setShowStrikes] = React.useState(false);
  const strikeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

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

  const hideStrikeOverlay = React.useCallback(() => {
    if (strikeTimerRef.current) {
      clearTimeout(strikeTimerRef.current);
    }

    setShowStrikes(false);
    strikeTimerRef.current = null;
  }, []);

  const showStrikeOverlay = React.useCallback(() => {
    if (strikeTimerRef.current) {
      clearTimeout(strikeTimerRef.current);
    }

    setShowStrikes(true);
    strikeTimerRef.current = setTimeout(() => {
      setShowStrikes(false);
      strikeTimerRef.current = null;
    }, 1500);
  }, []);

  React.useEffect(() => {
    return () => {
      if (strikeTimerRef.current) {
        clearTimeout(strikeTimerRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (!data?.gameInstanceId) return;
    const channel = supabase
      .channel(data.gameInstanceId)
      .on('broadcast', { event: 'GameAction' }, (event) => {
        const { type, state } = sentEvent.parse(event.payload);
        switch (type) {
          case 'StartQuestion':
            hideStrikeOverlay();
            break;
          case 'Strike':
            showStrikeOverlay();
            break;
        }
        updateQuery(state);
        playActionSound(type);
      })
      .on('broadcast', { event: 'sound' }, (event) => {
        const result = soundEvent.safeParse(event.payload);
        if (result.success) playSound(result.data.sound);
      })
      .subscribe();
    return () => void supabase.removeChannel(channel);
  }, [
    supabase,
    data?.gameInstanceId,
    hideStrikeOverlay,
    playActionSound,
    playSound,
    showStrikeOverlay,
    updateQuery,
  ]);

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
    strikes: state?.strikes ?? 0,
    showStrikes,
    answers: state?.answers ?? {},
  };
};
