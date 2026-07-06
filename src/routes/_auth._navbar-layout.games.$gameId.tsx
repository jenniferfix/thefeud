import { RestrictToVerticalAxis } from '@dnd-kit/abstract/modifiers';
import { move } from '@dnd-kit/helpers';
import { DragDropProvider } from '@dnd-kit/react';
import { ClientOnly, createFileRoute, Link } from '@tanstack/react-router';
import { generateKeyBetween } from 'fractional-indexing';
import { ArrowBigLeft, Plus, Settings } from 'lucide-react';
import React from 'react';
import { AddQuestionToGameDialog } from '#/components/editor/AddQuestionToGameDialog';
import { QuestionListing } from '#/components/editor/QuestionListing';
import { LocalDateTime } from '#/components/LocalDateTime';
import { Button, buttonVariants } from '#/components/ui/button';
import {
  getGameQueryOptions,
  useGetGame,
  useRemoveQuestionFromGame,
  useUpdateQuestionForGame,
} from '#/hooks/usegamequeries';
import { cn } from '#/lib/utils';
import { GameDialog } from '@/components/editor/GameDialog';

export const Route = createFileRoute('/_auth/_navbar-layout/games/$gameId')({
  loader: async ({
    context: { queryClient, supabase },
    params: { gameId },
  }) => {
    await Promise.all([
      queryClient.ensureQueryData(getGameQueryOptions(supabase, gameId)),
    ]);
  },
  component: RouteComponent,
});

const GridItem = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return <div className={cn('border-b py-2', className)} {...props} />;
};

function RouteComponent() {
  const { gameId } = Route.useParams();
  const { data: currentGame, isLoading } = useGetGame(gameId);
  const removeQuestion = useRemoveQuestionFromGame();
  const updateGameQuestion = useUpdateQuestionForGame();
  const lastValidOrderRef = React.useRef<string[] | null>(null);

  if (isLoading || !currentGame) return null;

  const sortedQuestions = [...currentGame.game_questions].sort((a, b) => {
    if (a.position < b.position) return -1;
    if (a.position > b.position) return 1;
    return 0;
  });
  const sortedQuestionIds = sortedQuestions.map((q) => q.questions.id);
  const questionsById = new Map(
    sortedQuestions.map((q) => [q.questions.id, q]),
  );
  const lastPosition = sortedQuestions.at(-1)?.position;

  return (
    <div className="w-full max-w-4xl px-2 sm:px-6">
      <div className="my-4 sm:my-6">
        <Link
          to="/games"
          className={buttonVariants({
            variant: 'ghost',
            className: 'self-center mr-4',
          })}
        >
          <ArrowBigLeft /> Back to games
        </Link>
        <div className="pl-4">
          <h3 className="grow self-center text-3xl font-bold my-4">
            {currentGame.name}
          </h3>
          <div className="flex">
            <GameDialog gameId={gameId} name={currentGame.name} edit>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="self-center"
              >
                <Settings />
              </Button>
            </GameDialog>
            <AddQuestionToGameDialog
              lastPosition={lastPosition}
              existingIds={sortedQuestions.map((q) => q.questions.id)}
              gameId={gameId}
            >
              <Button variant="ghost" className="self-center">
                <Plus /> Add Question
              </Button>
            </AddQuestionToGameDialog>
          </div>
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4">
              <>
                <GridItem className="">Created:</GridItem>
                <GridItem className="">
                  <ClientOnly>
                    <LocalDateTime value={currentGame.created_at} />
                  </ClientOnly>
                </GridItem>
              </>
              <>
                <GridItem>Last played:</GridItem>
                <GridItem>Never</GridItem>
              </>
              <>
                <GridItem>Number questions:</GridItem>
                <GridItem>{currentGame.game_questions.length}</GridItem>
              </>
            </div>
          </div>
        </div>
      </div>
      <div>
        <DragDropProvider
          modifiers={[RestrictToVerticalAxis]}
          onDragStart={() => {
            lastValidOrderRef.current = sortedQuestionIds;
          }}
          onDragOver={(event) => {
            const { source, target, canceled } = event.operation;
            if (canceled || !target || !source) return;
            if (!questionsById.has(String(source.id))) return;
            if (!questionsById.has(String(target.id))) return;
            const nextOrder = move(sortedQuestionIds, event);

            if (nextOrder !== sortedQuestionIds) {
              lastValidOrderRef.current = nextOrder;
            }
          }}
          onDragEnd={async (event) => {
            const { source, target, canceled } = event.operation;
            const suspend = event.suspend();

            if (canceled || !source) {
              suspend.abort();
              return;
            }

            const movedId = String(source.id);
            const finalTargetId = target ? String(target.id) : null;
            const finalTargetIsValid =
              finalTargetId !== null && questionsById.has(finalTargetId);

            const nextOrder = finalTargetIsValid
              ? move(sortedQuestionIds, event)
              : lastValidOrderRef.current;

            if (!nextOrder) {
              suspend.abort();
              return;
            }

            const newIdx = nextOrder.findIndex((id) => id === movedId);

            if (newIdx === -1) {
              suspend.abort();
              return;
            }

            const unchanged =
              nextOrder.length === sortedQuestionIds.length &&
              nextOrder.every((id, index) => id === sortedQuestionIds[index]);

            if (unchanged) {
              suspend.resume();
              return;
            }

            const prevPos =
              questionsById.get(nextOrder[newIdx - 1])?.position ?? null;
            const nextPos =
              questionsById.get(nextOrder[newIdx + 1])?.position ?? null;

            const newPosition = generateKeyBetween(prevPos, nextPos);

            try {
              updateGameQuestion.mutate({
                gameId,
                questionId: movedId,
                position: newPosition,
              });
              suspend.resume();
            } catch {
              suspend.abort();
            }
          }}
        >
          {sortedQuestions.map((q, index) => (
            <QuestionListing
              sortable={true}
              showDelete
              question={q.questions}
              deleteQuestion={async () => {
                await removeQuestion.mutateAsync({
                  questionId: q.questions.id,
                  gameId,
                });
              }}
              index={index}
              key={q.questions.id}
            />
          ))}
        </DragDropProvider>
      </div>
    </div>
  );
}
