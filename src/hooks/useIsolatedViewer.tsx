import {
  queryOptions,
  useMutation,
  useSuspenseQuery,
} from '@tanstack/react-query';
import React from 'react';
import {
  ActionType,
  actionsEnum,
  leftScore,
  rightScore,
  roundScore,
} from '#/lib/schemas/base';
import type {
  CorrectAnswerType,
  StartQuestionType,
  StrikeType,
} from '#/lib/schemas/events';
import { EventPayloadSchema } from '#/lib/schemas/events';
import type { ConfettiMode } from '#/lib/schemas/game';
import type { AnswerRecord } from '#/lib/schemas/gameboard';
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
    data?.state.questionTitle ?? '',
  );
  const [roundScore, setRoundScore] = React.useState(
    data?.state.roundScore ?? 0,
  );
  const [confettiMode, setConfettiMode] = React.useState<ConfettiMode>(
    data?.state.confettiMode ?? 'disabled',
  );
  const [strikes, setStrikes] = React.useState(0);
  const [showStrikes, setShowStrikes] = React.useState(false);
  const [answers, setAnswers] = React.useState<AnswerRecord>({});

  React.useEffect(() => {
    if (!data?.state) return;

    setGameTitle(data.state.gameTitle ?? '');
    setLeftTeam(data.state.leftTeam ?? '');
    setLeftScore(data.state.leftScore ?? 0);
    setRightTeam(data.state.rightTeam ?? '');
    setRightScore(data.state.rightScore ?? 0);
    setQuestionText(data.state.questionTitle ?? '');
    setRoundScore(data.state.roundScore ?? 0);
    setConfettiMode(data.state.confettiMode ?? 'disabled');
    setAnswers(data.state.answers ?? {});
  }, [data]);
  console.log('initial viewer data', data);

  const handleStartQuestion = React.useCallback(
    ({
      questionName,
      rightScore,
      roundScore,
      leftScore,
      answers,
    }: StartQuestionType) => {
      setQuestionText(questionName);
      setAnswers(answers);
      setRightScore(rightScore);
      setLeftScore(leftScore);
      setRoundScore(roundScore);
    },
    [],
  );

  const handleCorrectAnswer = React.useCallback(
    ({ answer, rightScore, roundScore, leftScore }: CorrectAnswerType) => {
      setAnswers((last) => ({
        ...last,
        [answer.position]: { text: answer.text, score: answer.score },
      }));
      setRoundScore(roundScore + answer.score);
      setLeftScore(leftScore);
      setRightScore(rightScore);
    },
    [],
  );

  console.log('useIsolatedViewer', data);

  const parseData = React.useCallback((event: string, payload: string) => {
    const action = actionsEnum.parse(event);
    const { data, success, error } = EventPayloadSchema[action].safeParse(
      JSON.parse(payload),
    );
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
    if (!data?.gameInstanceId) return;
    const channel = supabase
      .channel(data.gameInstanceId)
      .on('broadcast', { event: 'StartQuestion' }, (event) => {
        console.log('onstart', event);
        const { payload } = event;
        const data = parseData(event.event, payload._json);
        console.log('StartQuestion', data);
        handleStartQuestion(data as StartQuestionType);
      })
      .on('broadcast', { event: 'CorrectAnswer' }, (event) => {
        const { payload } = event;
        console.log('evet', event);
        const data = parseData(event.event, payload._json);
        handleCorrectAnswer(data as CorrectAnswerType);
        console.log('CorrectAnswer', data);
      })
      .on('broadcast', { event: 'Strike' }, (event) => {
        const { payload } = event;
        const data = parseData(event.event, payload);
        console.log('Strike', data);
      })
      .on('broadcast', { event: 'RoundWin' }, (event) => {
        const { payload } = event;
        const data = parseData(event.event, payload);
        console.log('RoundWin', data);
      })
      .on('broadcast', { event: 'GameOver' }, (event) => {
        const { payload } = event;
        const data = parseData(event.event, payload);
        console.log('GameOver', data);
      })
      .subscribe();
    return () => void supabase.removeChannel(channel);
  }, [
    supabase,
    data?.gameInstanceId,
    handleCorrectAnswer,
    handleStartQuestion,
    parseData,
  ]);

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
