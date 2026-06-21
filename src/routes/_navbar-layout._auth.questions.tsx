import { createFileRoute } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import { QuestionDialog } from '#/components/editor/QuestionDialog';
import { QuestionListing } from '#/components/editor/QuestionListing';
import { SortControl } from '#/components/SortControl';
import {
  getUserQuestionsQueryOptions,
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
  //const { user } = Route.useRouteContext();
  const { data } = useGetUsersQuestions();

  return (
    <main className="px-2 sm:px-4">
      <section className="w-full">
        <h2 className="grow text-3xl font-bold my-4 self-center">Questions</h2>

        <div className="pl-4">
          <div className="flex justify-between">
            <QuestionDialog>
              <Button variant="outline" className="self-center">
                Add <PlusIcon />
              </Button>
            </QuestionDialog>
            <SortControl />
          </div>

          <div>
            {data?.map((q, i) => (
              <QuestionListing
                sortable={false}
                question={q}
                index={i}
                showDelete
                initialOpen
                key={i}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
