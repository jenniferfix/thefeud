import React from 'react';
import type { ActionType } from '#/lib/schemas/base';
import { gameEventSchema } from '#/lib/schemas/events';
import type { GameBoardState } from '#/lib/schemas/gameboard';
import { useGameSounds } from './useGameSounds';

type UseGameActionSubscriptionProps = {
  gameInstanceId?: string | null;
  onAction?: (type: ActionType, state: GameBoardState) => void;
  onConnect?: () => void;
  onState?: (state: GameBoardState) => void;
  soundsEnabled?: boolean;
};

export const useGameActionSubscription = ({
  gameInstanceId,
  onAction,
  onConnect,
  onState,
  soundsEnabled = true,
}: UseGameActionSubscriptionProps) => {
  const { playSound, playActionSound } = useGameSounds({
    enabled: soundsEnabled,
  });
  const onActionRef = React.useRef(onAction);
  const onConnectRef = React.useRef(onConnect);
  const onStateRef = React.useRef(onState);
  const playSoundRef = React.useRef(playSound);
  const playActionSoundRef = React.useRef(playActionSound);

  React.useEffect(() => {
    onActionRef.current = onAction;
    onConnectRef.current = onConnect;
    onStateRef.current = onState;
    playSoundRef.current = playSound;
    playActionSoundRef.current = playActionSound;
  }, [onAction, onConnect, onState, playActionSound, playSound]);

  React.useEffect(() => {
    if (!gameInstanceId) return;

    const eventSource = new EventSource(
      `/api/game-events/${encodeURIComponent(gameInstanceId)}`,
    );

    eventSource.onopen = () => onConnectRef.current?.();
    eventSource.onmessage = (message) => {
      let payload: unknown;

      try {
        payload = JSON.parse(message.data);
      } catch (error) {
        console.error('Invalid game event JSON', error);
        return;
      }

      const result = gameEventSchema.safeParse(payload);
      if (!result.success) {
        console.error('Invalid game event payload', result.error);
        return;
      }

      if (result.data.kind === 'action') {
        const { type, state } = result.data;
        onStateRef.current?.(state);
        onActionRef.current?.(type, state);
        playActionSoundRef.current(type);
        return;
      }

      playSoundRef.current(result.data.sound);
    };

    return () => {
      eventSource.close();
    };
  }, [gameInstanceId]);
};
