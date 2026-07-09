import React from 'react';
import type { ActionType } from '#/lib/schemas/base';
import {
  sentEvent,
  soundEvent,
  type VolumeEvent,
  volumeEvent,
} from '#/lib/schemas/events';
import type { GameBoardState } from '#/lib/schemas/gameboard';
import { useGameSounds } from './useGameSounds';
import { useSupabase } from './useSupabase';

type UseGameActionSubscriptionProps = {
  channelId?: string | null;
  onAction?: (type: ActionType, state: GameBoardState) => void;
  onState?: (state: GameBoardState) => void;
  onVolume?: (settings: VolumeEvent) => void;
  soundsEnabled?: boolean;
  volume?: number;
};

export const useGameActionSubscription = ({
  channelId,
  onAction,
  onState,
  onVolume,
  soundsEnabled = true,
  volume = 1,
}: UseGameActionSubscriptionProps) => {
  const supabase = useSupabase();
  const { playSound, playActionSound } = useGameSounds({
    enabled: soundsEnabled,
    volume,
  });
  const onActionRef = React.useRef(onAction);
  const onStateRef = React.useRef(onState);
  const onVolumeRef = React.useRef(onVolume);
  const playSoundRef = React.useRef(playSound);
  const playActionSoundRef = React.useRef(playActionSound);

  React.useEffect(() => {
    onActionRef.current = onAction;
    onStateRef.current = onState;
    onVolumeRef.current = onVolume;
    playSoundRef.current = playSound;
    playActionSoundRef.current = playActionSound;
  }, [onAction, onState, onVolume, playActionSound, playSound]);

  React.useEffect(() => {
    if (!channelId) return;

    const channel = supabase
      .channel(channelId, {
        config: { private: true },
      })
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
      .on('broadcast', { event: 'volume' }, (event) => {
        const result = volumeEvent.safeParse(event.payload);
        if (result.success) onVolumeRef.current?.(result.data);
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [channelId, supabase]);
};
