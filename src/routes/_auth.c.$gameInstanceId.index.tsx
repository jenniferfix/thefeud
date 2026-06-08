import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import QuestionSelector from '@/components/gamecontrol/QuestionSelector';
import { getGameQuestionsQueryOptions } from '@/hooks/usegamequeries';
import {
  getInstanceGameQueryOptions,
  useGetInstanceGame,
} from '@/hooks/useinstancequeries';
export const Route = createFileRoute('/_auth/c/$gameInstanceId/')({
  loader: async ({ context: { queryClient }, params }) => {
    await queryClient.ensureQueryData(
      getInstanceGameQueryOptions(params.gameInstanceId),
    );
  },
  component: () => <Page />,
});

const Page = () => {
  const params = Route.useParams();
  const { data, isError, error, isLoading } = useSuspenseQuery(
    getInstanceGameQueryOptions(params.gameInstanceId),
  );

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>{error?.message}</div>;
  return (
    <QuestionSelector
      gameId={data?.games?.id || ''}
      instanceId={params.gameInstanceId}
    />
  );
};
