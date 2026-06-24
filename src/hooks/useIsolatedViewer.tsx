import {
  queryOptions,
  useMutation,
  useSuspenseQuery,
} from '@tanstack/react-query';
import React from 'react';
import { leftScore, rightScore, roundScore } from '#/lib/schemas/base';
import type {
  CorrectAnswerType,
  EventSchem,
  StartQuestionType,
  StrikeType,
} from '#/lib/schemas/events';
import { actionsEnum, EventSchema } from '#/lib/schemas/events';
import type { ConfettiMode } from '#/lib/schemas/game';
import { useGetJoinCodeGame } from './usejoincodes';
import useSupabase from './useSupabase';

export const useIsolatedViewer = (joinCode: string) => {
  const { data, refetch } = useGetJoinCodeGame(joinCode);
  const supabase = useSupabase();

  const [gameTitle, setGameTitle] = React.useState(data?.state.gameTitle ?? '');
  const [leftTeam, setLeftTeam] = React.useState(data?.state.leftTeam ?? '');
  const [leftScore, setLeftScore] = React.useState(data?.state.leftScore ?? 0);
  const [rightTeam, setRightTeam] = React.useState(data?.state.rightTeam ?? '');
  const [rightScore, setRightScore] = React.useState(
    data?.state.rightScore ?? 0,
  );
  const [questionText, setQuestionText] = React.useState(
    data?.state.questionName ?? '',
  );
  const [roundScore, setRoundScore] = React.useState(
    data?.state.roundScore ?? 0,
  );
  const [confettiMode, setConfettiMode] = React.useState<ConfettiMode>(
    data?.state.confettiMode ?? 'disabled',
  );
  const [strikes, setStrikes] = React.useState(0);
  const [showStrikes, setShowStrikes] = React.useState(false);
  const [answers, setAnswers] = React.useState({});

  const handleStartQuestion = React.useCallback(
    (data: StartQuestionType) => {
      setQuestionText(data.questionName);
      setAnswers(data.answers);
    },
    [data],
  );

  const parseData = React.useCallback((event: string, payload: string) => {
    const action = actionsEnum.parse(event);
    const { data, success, error } = EventSchema[action].safeParse(payload);
    if (!success) throw Error("Couldn't parse event", error);
    return data;
  }, []);

  // export enum GameActions {
  //   StartQuestion = 1, // game id
  //   CorrectAnswer, // question field, team field
  //   Strike, // Team
  //   RoundWin,
  //   GameOver,
  // }
  React.useEffect(() => {
    const channel = supabase
      .channel(data?.gameInstanceId ?? '')
      .on('broadcast', { event: 'StartQuestion' }, (event) => {
        const action = actionsEnum.parse(event);
        const { payload } = event;
        const data = parseData(event.event, payload);
        handleStartQuestion(data as StartQuestionType);
      })
      .on('broadcast', { event: 'CorrectAnswer' }, (event) => {
        const { payload } = event;
        parseData(event.event, payload);
      })
      .on('broadcast', { event: 'Strike' }, (event) => {
        const { payload } = event;
        parseData(event.event, payload);
      })
      .on('broadcast', { event: 'RoundWin' }, (event) => {
        const { payload } = event;
        parseData(event.event, payload);
      })
      .on('broadcast', { event: 'GameOver' }, (event) => {
        const { payload } = event;
        parseData(event.event, payload);
      });
    () => supabase.removeChannel(channel);
  });

  console.log(data);
  return {
    gameTitle,
    leftTeam,
    rightTeam,
    rightScore,
    leftScore,
    questionText,
    roundScore,
    confettiMode,
    strikes,
    showStrikes,
    answers,
  };
};
