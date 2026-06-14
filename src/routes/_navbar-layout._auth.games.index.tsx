import { createFileRoute, Link } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import { GameDialog } from '#/components/editor/GameDialog';
import { GameItem } from '#/components/editor/GameItem';
import type { GameType } from '#/lib/schemas/game';
import { Button } from '@/components/ui/button';
import { Item, ItemContent, ItemHeader, ItemTitle } from '@/components/ui/item';
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
    <div className="p-2">
      <div>
        <div className="flex">
          <h2 className="grow my-4 text-3xl font-bold">Your Games!</h2>
          <GameDialog>
            <Button size="icon" variant="ghost" className="self-center mr-2">
              <PlusIcon />
            </Button>
          </GameDialog>
        </div>

        <div className="max-w-3xl">
          {data?.map((g) => (
            <Link to="/games/$gameId" params={{ gameId: g.id }} key={g.id}>
              <GameItem id={g.id} name={g.name ?? ''} questions={g.questions} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
