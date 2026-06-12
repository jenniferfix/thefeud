import { createFileRoute } from '@tanstack/react-router';
import { GameItem } from '#/components/editor/GameItem';
import type { GameType } from '#/lib/schemas/game';
import { Item, ItemContent, ItemHeader, ItemTitle } from '@/components/ui/item';
import {
  getUserGamesQueryOptions,
  useGetUserGames,
} from '@/hooks/usegamequeries';

export const Route = createFileRoute('/_navbar-layout/_auth/games')({
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
    <div className="p-2">
      <div>
        <h2 className="my-4 text-3xl font-bold">Your Games!</h2>
        <div className="max-w-3xl">
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
    </div>
  );
}
