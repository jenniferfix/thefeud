import { notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { backendEventSchema } from '#/lib/schemas/eventsbackend';
import type { AnswerRecord, GameBoardState } from '#/lib/schemas/gameboard';
import { insertEvent } from '#/queries/eventqueries';
import { getGameInstance, updateGameInstance } from '#/queries/instancequeries';
import { createSupabaseBackendClient } from '#/utils/supabase/backend';
import type { SentEvent } from '@/lib/schemas/events';
import { GameActions, Teams } from '@/types';
import { getServerAuth } from './auth';
import { toGameBoardState } from './gameboard-state';
import { updateJoinCode } from './joincodes';

const supabase = createSupabaseBackendClient();

export const processEvent = createServerFn({ method: 'GET' })
  .validator(backendEventSchema)
  .handler(async ({ data }) => {
    const auth = await getServerAuth();
    if (!auth.user) return;
    const {
      data: currentGameInstance,
      success,
      error,
    } = await getGameInstance(supabase, data.gameInstanceId);
    if (!currentGameInstance.joinCode) throw Error('Must have join code');
    if (!success) throw notFound({ data: { error } });

    const currentState = toGameBoardState(currentGameInstance);

    const { joinCode: code } = currentGameInstance;

    switch (data.type) {
      case 'StartQuestion': {
        const {
          gameInstanceId,
          data: { questionId },
        } = data;
        const questionSearch = currentGameInstance.game.questions.find(
          (q) => q.question.id === questionId,
        );
        if (!questionSearch) throw Error('Question not found');
        const { question } = questionSearch;

        const answers: AnswerRecord = {};
        question.answers.forEach((_answer, i) => {
          answers[i + 1] = null;
        });
        const newState = {
          ...currentState,
          roundScore: 0,
          strikes: 0,
          answers,
          questionTitle: question.text,
          currentQuestionId: question.id,
          confettiMode: 'disabled',
        } as GameBoardState;

        await Promise.all([
          //update db
          updateGameInstance(supabase, gameInstanceId, {
            current_question_id: questionId,
            question_text: question.text,
            round_score: 0,
            strikes: 0,
            answers,
          }),
          //update redis
          updateJoinCode({
            data: {
              gameInstanceId,
              code,
              state: newState,
            },
          }),
          // add event to db
          insertEvent(supabase, {
            eventid: GameActions.StartQuestion,
            userid: auth.user.id,
            instanceid: gameInstanceId,
            questionid: questionId,
          }),
        ]);
        //send event
        await supabase.channel(gameInstanceId).httpSend('GameAction', {
          type: data.type,
          state: newState,
        } satisfies SentEvent);
        break;
      }

      case 'CorrectAnswer': {
        const {
          gameInstanceId,
          data: { answerId },
        } = data;
        const questionSearch = currentGameInstance.game.questions.find(
          (q) => q.question.id === currentState.currentQuestionId,
        );
        if (!questionSearch) throw Error('Question not found');
        const { question } = questionSearch;
        let answerPos: number | null = null;
        const answer = question.answers.find((a, i) => {
          if (a.id === answerId) {
            answerPos = i + 1;
            return true;
          }
          return false;
        });
        if (!answer || !answerPos) throw Error('Answer not found');

        const updatedAnswers = {
          ...currentState.answers,
          [answerPos]: { text: answer.text, score: answer.score },
        } satisfies AnswerRecord;

        const newState = {
          ...currentState,
          roundScore: currentState.roundScore + answer.score,
          answers: updatedAnswers,
        } as GameBoardState;
        await Promise.all([
          //update db
          updateGameInstance(supabase, gameInstanceId, {
            round_score: newState.roundScore,
            answers: updatedAnswers,
          }),
          //update redis
          updateJoinCode({
            data: {
              gameInstanceId,
              code,
              state: newState,
            },
          }),
          insertEvent(supabase, {
            eventid: GameActions.CorrectAnswer,
            userid: auth.user.id,
            instanceid: gameInstanceId,
            answerid: answerId,
            points: answer.score,
          }),
        ]);
        await supabase.channel(gameInstanceId).httpSend('GameAction', {
          type: data.type,
          state: newState,
        } satisfies SentEvent);
        break;
      }

      case 'Strike': {
        const { gameInstanceId } = data;
        const strikes = Math.min(currentGameInstance.strikes + 1, 3);
        const newState = { ...currentState, strikes } as GameBoardState;
        await Promise.all([
          //update db
          updateGameInstance(supabase, gameInstanceId, {
            strikes: newState.strikes,
          }),
          //update redis
          updateJoinCode({
            data: {
              gameInstanceId,
              code,
              state: newState,
            },
          }),
          insertEvent(supabase, {
            eventid: GameActions.Strike,
            userid: auth.user.id,
            instanceid: gameInstanceId,
          }),
        ]);
        await supabase.channel(gameInstanceId).httpSend('GameAction', {
          type: data.type,
          state: newState,
        } satisfies SentEvent);

        break;
      }

      case 'RoundWin': {
        const {
          gameInstanceId,
          data: { team },
        } = data;
        const newState = {
          ...currentState,
          leftScore:
            team === Teams.Left
              ? currentState.leftScore + currentState.roundScore
              : currentState.leftScore,
          rightScore:
            team === Teams.Right
              ? currentState.rightScore + currentState.roundScore
              : currentState.rightScore,
          confettiMode: team === Teams.Left ? 'left' : 'right',
        } as GameBoardState;
        await Promise.all([
          //update db
          updateGameInstance(supabase, gameInstanceId, {
            round_score: newState.roundScore,
            left_score: newState.leftScore,
            right_score: newState.rightScore,
          }),
          //update redis
          updateJoinCode({
            data: {
              gameInstanceId,
              code,
              state: newState,
            },
          }),
          insertEvent(supabase, {
            eventid: GameActions.RoundWin,
            userid: auth.user.id,
            instanceid: gameInstanceId,
            team,
          }),
        ]);
        await supabase.channel(gameInstanceId).httpSend('GameAction', {
          type: data.type,
          state: newState,
        } satisfies SentEvent);
        break;
      }

      case 'GameOver': {
        const {
          gameInstanceId,
          data: { team },
        } = data;
        const newState = { ...currentState, gameover: true } as GameBoardState;
        await Promise.all([
          //update db
          updateGameInstance(supabase, gameInstanceId, {
            finished: new Date().toISOString(),
            round_score: newState.roundScore,
          }),
          //update redis
          updateJoinCode({
            data: {
              gameInstanceId,
              code,
              state: newState,
            },
          }),
          insertEvent(supabase, {
            eventid: GameActions.GameOver,
            userid: auth.user.id,
            instanceid: gameInstanceId,
            team,
          }),
        ]);
        await supabase.channel(gameInstanceId).httpSend('GameAction', {
          type: data.type,
          state: newState,
        } satisfies SentEvent);
        break;
      }
    }
  });
