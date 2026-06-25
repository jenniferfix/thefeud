import { notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { type ActionType, roundScore } from '#/lib/schemas/base';
import {
  createPayload,
  type EventPayloadSchema,
  eventPayloadSchema,
} from '#/lib/schemas/events';
import { backendEventSchema } from '#/lib/schemas/eventsbackend';
import type { ConfettiMode } from '#/lib/schemas/game';
import {
  AnswerRecord,
  GameBoardState,
  type GameboardUpdateType,
  gameboardAnswers,
  gameboardUpdateState,
} from '#/lib/schemas/gameboard';
import {
  insertEvent as dbInsertEvent,
  insertEvent,
} from '#/queries/eventqueries';
import { getGameInstance, updateGameInstance } from '#/queries/instancequeries';
import { createSupabaseBackendClient } from '#/utils/supabase/backend';
import { GameActions, Teams } from '@/types';
import { getServerAuth } from './auth';
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
    const { joinCode: code } = currentGameInstance;

    const currentState = {
      confettiMode: currentGameInstance.confettiMode as ConfettiMode,
      leftScore: currentGameInstance.leftScore,
      leftTeam:
        currentGameInstance.leftTeam === null
          ? ''
          : currentGameInstance.leftTeam,
      rightScore: currentGameInstance.rightScore,
      rightTeam:
        currentGameInstance.rightTeam === null
          ? ''
          : currentGameInstance.rightTeam,
      roundScore: currentGameInstance.roundScore,
      strikes: currentGameInstance.strikes,
      gameTitle: currentGameInstance.game.name,
      questionTitle: currentGameInstance.questionText,
      currentQuestionId: currentGameInstance.currentQuestionId,
      gameover: !!currentGameInstance.finished,
      answers: gameboardAnswers.parse(currentGameInstance.answers),
    } satisfies GameboardUpdateType;

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
        question.answers.forEach((a, i) => {
          answers[i + 1] = null;
        });
        const newState = {
          ...currentState,
          roundScore: 0,
          answers,
          questionTitle: question.text,
          currentQuestionId: question.id,
        } as GameBoardState;

        const p = createPayload('StartQuestion', {
          leftScore: currentState.leftScore,
          rightScore: currentState.rightScore,
          questionName: question.text,
          roundScore: 0,
          answers,
        });
        if (!p.success) throw Error('Error creating payload', p.error);
        await Promise.all([
          //update db
          updateGameInstance(supabase, gameInstanceId, {
            current_question_id: questionId,
            question_text: question.text,
            round_score: 0,
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
          //send event
          supabase.channel(gameInstanceId).httpSend('StartQuestion', p.payload),
        ]);
        break;
      }

      case 'CorrectAnswer': {
        const {
          gameInstanceId,
          data: { answerId, points },
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
        console.log('answer', answer);
        console.log('oldanswers', currentState.answers);
        console.log('newAnswers', updatedAnswers);
        console.log('mergedstate', newState);

        // setAnswers((last) => ({
        //   ...last,
        //   [answer.position]: { text: answer.text, score: answer.score },
        // }));
        const p = createPayload('CorrectAnswer', {
          rightScore: currentState.rightScore,
          leftScore: currentState.leftScore,
          roundScore: currentState.roundScore,
          answer: {
            id: answer.id,
            text: answer.text,
            score: answer.score,
            position: answerPos,
          },
        });
        if (!p.success) throw Error('Error creating payload', p.error);
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
            points,
          }),
          supabase.channel(gameInstanceId).httpSend('CorrectAnswer', p.payload),
        ]);
        break;
      }

      case 'Strike': {
        const {
          gameInstanceId,
          data: { team },
        } = data;
        const strikes = Math.min(currentGameInstance.strikes + 1, 3);
        const newState = { ...currentState, strikes } as GameBoardState;
        const p = createPayload('Strike', newState);
        if (!p.success) throw Error('Error creating payload', p.error);

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
          supabase.channel(gameInstanceId).httpSend('Strike', p.payload),
        ]);

        break;
      }

      case 'RoundWin': {
        const {
          gameInstanceId,
          data: { team },
        } = data;
        const newState = {
          ...currentState,
          roundScore: 0,
          leftScore:
            team === Teams.Left
              ? currentState.leftScore + currentState.roundScore
              : currentState.leftScore,
          rightScore:
            team === Teams.Right
              ? currentState.rightScore + currentState.roundScore
              : currentState.rightScore,
        } as GameBoardState;

        const p = createPayload('RoundWin', {
          ...newState,
          rightScore: newState.rightScore,
          leftScore: newState.leftScore,
          roundScore: newState.roundScore,
          team,
        });
        if (!p.success) throw Error('Error creating payload', p.error);
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
          supabase.channel(gameInstanceId).httpSend('RoundWin', p.payload),
        ]);
        break;
      }

      case 'GameOver': {
        const {
          gameInstanceId,
          data: { team },
        } = data;
        const newState = { ...currentState, gameover: true } as GameBoardState;
        const p = createPayload('GameOver', {
          ...newState,
          gameover: newState.gameover,
        });
        if (!p.success) throw Error('Error creating payload', p.error);

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
          supabase.channel(gameInstanceId).httpSend('GameOver', p.payload),
        ]);
        break;
      }
    }
  });
