import { notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import {
  createCorrectAnswerState,
  createGameOverState,
  createRoundWinState,
  createStartQuestionState,
  createStrikeState,
  toGameBoardState,
} from '#/lib/gameboard-state';
import type { ActionType } from '#/lib/schemas/base';
import { backendEventSchema } from '#/lib/schemas/eventsbackend';
import type { GameBoardState } from '#/lib/schemas/gameboard';
import { insertEvent } from '#/queries/eventqueries';
import { getGameInstance, updateGameInstance } from '#/queries/instancequeries';
import type { Database, TablesUpdate } from '#/types/supabase.types';
import { createSupabaseBackendClient } from '#/utils/supabase/backend';
import type { SentEvent } from '@/lib/schemas/events';
import { GameActions } from '@/types';
import { getServerAuth } from './auth';
import { updateJoinCode } from './joincodes';

const supabase = createSupabaseBackendClient();

type GameInstanceUpdate = TablesUpdate<'game_instance'>;
type GameEventInsert = Database['public']['Tables']['game_events']['Insert'];

type CommitEventArgs = {
  event: GameEventInsert;
  gameInstanceId: string;
  state: GameBoardState;
  type: ActionType;
  values: GameInstanceUpdate;
};

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
    if (!success || !currentGameInstance) throw notFound({ data: { error } });
    if (!currentGameInstance.joinCode) throw Error('Must have join code');

    const currentState = toGameBoardState(currentGameInstance);

    const { joinCode: code } = currentGameInstance;
    const commitEvent = async ({
      gameInstanceId,
      type,
      state,
      values,
      event,
    }: CommitEventArgs) => {
      await Promise.all([
        updateGameInstance(supabase, gameInstanceId, values),
        updateJoinCode({
          data: {
            gameInstanceId,
            code,
            state,
          },
        }),
        insertEvent(supabase, event),
      ]);

      await supabase.channel(gameInstanceId).httpSend('GameAction', {
        type,
        state,
      } satisfies SentEvent);

      return { gameInstanceId, type, state };
    };

    switch (data.type) {
      case 'StartQuestion': {
        const {
          gameInstanceId,
          data: { questionId },
        } = data;
        const newState = createStartQuestionState(
          currentGameInstance,
          currentState,
          questionId,
        );

        return await commitEvent({
          gameInstanceId,
          type: data.type,
          state: newState,
          values: {
            current_question_id: questionId,
            question_text: newState.questionTitle,
            round_score: 0,
            strikes: 0,
            answers: newState.answers,
            confetti_mode: newState.confettiMode,
          },
          event: {
            eventid: GameActions.StartQuestion,
            userid: auth.user.id,
            instanceid: gameInstanceId,
            questionid: questionId,
          },
        });
      }

      case 'CorrectAnswer': {
        const {
          gameInstanceId,
          data: { answerId },
        } = data;
        const result = createCorrectAnswerState(
          currentGameInstance,
          currentState,
          answerId,
        );

        if (!result.changed) {
          return {
            gameInstanceId,
            type: data.type,
            state: result.state,
          };
        }

        const newState = result.state;
        return await commitEvent({
          gameInstanceId,
          type: data.type,
          state: newState,
          values: {
            round_score: newState.roundScore,
            answers: newState.answers,
          },
          event: {
            eventid: GameActions.CorrectAnswer,
            userid: auth.user.id,
            instanceid: gameInstanceId,
            answerid: answerId,
            points: result.answer.score,
          },
        });
      }

      case 'Strike': {
        const { gameInstanceId } = data;
        const newState = createStrikeState(currentState);
        return await commitEvent({
          gameInstanceId,
          type: data.type,
          state: newState,
          values: {
            strikes: newState.strikes,
          },
          event: {
            eventid: GameActions.Strike,
            userid: auth.user.id,
            instanceid: gameInstanceId,
          },
        });
      }

      case 'RoundWin': {
        const {
          gameInstanceId,
          data: { team },
        } = data;
        const newState = createRoundWinState(currentState, team);
        return await commitEvent({
          gameInstanceId,
          type: data.type,
          state: newState,
          values: {
            round_score: newState.roundScore,
            left_score: newState.leftScore,
            right_score: newState.rightScore,
            completed_question_ids: newState.completedQuestionIds,
            confetti_mode: newState.confettiMode,
          },
          event: {
            eventid: GameActions.RoundWin,
            userid: auth.user.id,
            instanceid: gameInstanceId,
            team,
          },
        });
      }

      case 'GameOver': {
        const { gameInstanceId } = data;
        const newState = createGameOverState(currentState);
        return await commitEvent({
          gameInstanceId,
          type: data.type,
          state: newState,
          values: {
            finished: new Date().toISOString(),
            round_score: newState.roundScore,
            confetti_mode: newState.confettiMode,
          },
          event: {
            eventid: GameActions.GameOver,
            userid: auth.user.id,
            instanceid: gameInstanceId,
          },
        });
      }
    }
  });
