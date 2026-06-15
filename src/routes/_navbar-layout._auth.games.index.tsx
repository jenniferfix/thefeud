import { createFileRoute, Link } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import { GameDialog } from '#/components/editor/GameDialog';
import { GameItem } from '#/components/editor/GameItem';
import { SortControl } from '#/components/SortControl';
import { Button } from '@/components/ui/button';
import {
  getUserGamesQueryOptions,
  useGetUserGames,
} from '@/hooks/usegamequeries';

export const Route = createFileRoute('/_navbar-layout/_auth/games/')({
  loader: async ({ context: { queryClient, user } }) => {
    await Promise.allSettled([
      queryClient.ensureQueryData(getUserGamesQueryOptions(user.id)),
    ]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = Route.useRouteContext();
  const { data } = useGetUserGames(user.id);

  return (
    <div className="px-2 sm:px-4">
      <section>
        <h2 className="grow my-4 text-3xl font-bold">Your Games!</h2>

        <div className="pl-2 sm:pl-4">
          <div className="flex">
            <GameDialog>
              <Button variant="outline" className="self-center mr-2">
                Add <PlusIcon />
              </Button>
            </GameDialog>
          </div>

          <div>
            {data?.map((g) => (
              <GameItem
                key={g.id}
                id={g.id}
                name={g.name ?? ''}
                questions={g.questions}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
