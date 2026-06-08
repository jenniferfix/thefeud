import { createFileRoute } from '@tanstack/react-router';
import NewGamePage from '@/components/gamecontrol/NewGamePage';
import { getGamesQueryOptions } from '@/hooks/usegamequeries';

export const Route = createFileRoute('/_navbar-layout/_auth/c/new')({
  loader: async ({ context: { queryClient } }) =>
    await queryClient.ensureQueryData(getGamesQueryOptions()),
  component: () => <NewGamePage />,
});
