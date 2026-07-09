import React from 'react';
import useSound from 'use-sound';
import type { ActionType } from '#/lib/schemas/base';
import type { GameSound } from '#/lib/schemas/events';

type UseGameSoundsProps = {
  enabled?: boolean;
  volume?: number;
};

type UseGameSoundsResult = {
  playSound: (sound: GameSound) => void;
  playActionSound: (type: ActionType) => void;
};

const ACTION_SOUNDS: Partial<Record<ActionType, GameSound>> = {
  StartQuestion: 'themeMusic',
  CorrectAnswer: 'ding',
  Strike: 'strike',
  RoundWin: 'clap',
  GameOver: 'themeMusic',
};

export const useGameSounds = ({
  enabled = true,
  volume = 1,
}: UseGameSoundsProps = {}): UseGameSoundsResult => {
  const [ding] = useSound(
    'https://utfs.io/f/H6iSz68ZupCoYLk2Vwhdq2xsSpPTCoOnh5XK83a70LRkiGEt',
    { format: ['mp3'], soundEnabled: enabled, volume },
  );
  const [strike] = useSound(
    'https://utfs.io/f/H6iSz68ZupCoMbf0C2NhZrC7uiAx6FkNYzDa84bnsqyKpdQB',
    { format: ['mp3'], soundEnabled: enabled, volume },
  );
  const [faceOffMusic] = useSound(
    'https://utfs.io/f/H6iSz68ZupCo4eKhb35E9ulnKd6JjxQ1WkrV4qp5YX3oHg0w',
    { format: ['mp3'], soundEnabled: enabled, volume },
  );
  const [faceOffBuzzer] = useSound(
    'https://utfs.io/f/H6iSz68ZupCoAiLTGxMQAScDCsTuMnEmH91yakxB76plzKiq',
    { format: ['mp3'], soundEnabled: enabled, volume },
  );
  const [themeMusic] = useSound(
    'https://utfs.io/f/H6iSz68ZupCoNGkGGFloauFQZAbTpW4OP5hCSDJM6Igcj9r2',
    { format: ['mp3'], soundEnabled: enabled, volume },
  );
  const [clap] = useSound(
    'https://utfs.io/f/H6iSz68ZupCoI8HGXcx1w0amDS2udhsfqj97lFyLkcIAQCez',
    { format: ['mp3'], soundEnabled: enabled, volume },
  );

  const enabledRef = React.useRef(enabled);
  const playersRef = React.useRef<Record<GameSound, () => void>>({
    ding,
    strike,
    faceOffMusic,
    faceOffBuzzer,
    themeMusic,
    clap,
  });

  React.useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  React.useEffect(() => {
    playersRef.current = {
      ding,
      strike,
      faceOffMusic,
      faceOffBuzzer,
      themeMusic,
      clap,
    };
  }, [ding, strike, faceOffMusic, faceOffBuzzer, themeMusic, clap]);

  const playSound = React.useCallback((sound: GameSound) => {
    if (!enabledRef.current) return;
    playersRef.current[sound]();
  }, []);

  const playActionSound = React.useCallback(
    (type: ActionType) => {
      const sound = ACTION_SOUNDS[type];
      if (!sound) return;
      playSound(sound);
    },
    [playSound],
  );

  return { playSound, playActionSound };
};
