import { ClientOnly, createFileRoute, Link } from '@tanstack/react-router';
import { ArrowBigLeft } from 'lucide-react';
import { z } from 'zod';
import { QuestionListing } from '#/components/editor/QuestionListing';
import { LocalDateTime } from '#/components/LocalDateTime';
import { Button, buttonVariants } from '#/components/ui/button';
import { getGameQueryOptions, useGetGame } from '#/hooks/usegamequeries';
import { cn } from '#/lib/utils';

export const Route = createFileRoute('/_navbar-layout/_auth/games/$gameId')({
  loader: async ({ context: { queryClient }, params: { gameId } }) => {
    await Promise.allSettled([
      queryClient.ensureQueryData(getGameQueryOptions(gameId)),
    ]);
  },
  component: RouteComponent,
});

const GridItem = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return <div className={cn('border-b py-2', className)} {...props} />;
};

function RouteComponent() {
  const { gameId } = Route.useParams();
  const { data, isError, error, isLoading } = useGetGame(gameId);

  if (isLoading || !data) return null;

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
          <div className="flex">
            <h3 className="grow self-center text-3xl font-bold my-4">
              {data.name}
            </h3>
          </div>
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4">
              <>
                <GridItem className="">Created:</GridItem>
                <GridItem className="">
                  <ClientOnly>
                    <LocalDateTime value={data.created_at} />
                  </ClientOnly>
                </GridItem>
              </>
              <>
                <GridItem>Last played:</GridItem>
                <GridItem>Never</GridItem>
              </>
              <>
                <GridItem>Number questions:</GridItem>
                <GridItem>{data.questions.length}</GridItem>
              </>
            </div>
          </div>
        </div>
      </div>
      <div>
        {data.questions.map((q) => (
          <QuestionListing
            key={q.id}
            id={q.id}
            questionId={q.id}
            question={q.question}
            answers={q.answers}
          />
        ))}
      </div>
    </div>
  );
}
