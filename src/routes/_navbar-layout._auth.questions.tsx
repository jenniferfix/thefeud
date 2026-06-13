import { createFileRoute } from '@tanstack/react-router';
import { MinusIcon, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import React from 'react';
import { QuestionDialog } from '#/components/editor/QuestionDialog';
import { QuestionListing } from '#/components/editor/QuestionListing';
import { SortControl } from '#/components/SortControl';
import {
  getUserQuestionsQueryOptions,
  useDeleteQuestion,
  useGetUsersQuestions,
} from '#/hooks/usequestionqueries';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_navbar-layout/_auth/questions')({
  loader: async ({ context: { queryClient, user } }) => {
    await Promise.allSettled([
      queryClient.ensureQueryData(getUserQuestionsQueryOptions(user.id)),
    ]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = Route.useRouteContext();
  const { data } = useGetUsersQuestions(user.id);

  return (
    <main className="p-2">
      <section className="w-full max-w-3xl">
        <h2 className="grow text-3xl font-bold my-4 self-center">Questions</h2>
        <div className="pl-4">
          <div className="flex justify-between">
            <QuestionDialog>
              <Button variant="outline" size="default" className="self-center">
                Add <PlusIcon />
              </Button>
            </QuestionDialog>
            <SortControl />
          </div>
          <div>
            {data?.map((q, i) => (
              <QuestionListing
                key={i}
                id={q.id}
                questionId={q.id}
                question={q.question}
                answers={q.answers}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
