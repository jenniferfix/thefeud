import React from 'react';
import type { ActionType } from '#/lib/schemas/base';
import { sentEvent, soundEvent } from '#/lib/schemas/events';
import type { GameBoardState } from '#/lib/schemas/gameboard';
import { useGameSounds } from './useGameSounds';
import { useSupabase } from './useSupabase';

type UseGameActionSubscriptionProps = {
  channelId?: string | null;
  onAction?: (type: ActionType, state: GameBoardState) => void;
  onState?: (state: GameBoardState) => void;
  soundsEnabled?: boolean;
};

export const useGameActionSubscription = ({
  channelId,
  onAction,
  onState,
  soundsEnabled = true,
}: UseGameActionSubscriptionProps) => {
  const supabase = useSupabase();
  const { playSound, playActionSound } = useGameSounds({
    enabled: soundsEnabled,
  });
  const onActionRef = React.useRef(onAction);
  const onStateRef = React.useRef(onState);
  const playSoundRef = React.useRef(playSound);
  const playActionSoundRef = React.useRef(playActionSound);

  React.useEffect(() => {
    onActionRef.current = onAction;
    onStateRef.current = onState;
    playSoundRef.current = playSound;
    playActionSoundRef.current = playActionSound;
  }, [onAction, onState, playActionSound, playSound]);

  React.useEffect(() => {
    if (!channelId) return;

    const channel = supabase
      .channel(channelId)
      .on('broadcast', { event: 'GameAction' }, (event) => {
        const { type, state } = sentEvent.parse(event.payload);
        onStateRef.current?.(state);
        onActionRef.current?.(type, state);
        playActionSoundRef.current(type);
      })
      .on('broadcast', { event: 'sound' }, (event) => {
        const result = soundEvent.safeParse(event.payload);
        if (result.success) playSoundRef.current(result.data.sound);
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [channelId, supabase]);
};
