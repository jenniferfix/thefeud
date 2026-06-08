import { createFileRoute } from '@tanstack/react-router';
import GameQuestionsPanel from '@/components/editor/GameQuestionsPanel';
import {
  getGameQueryOptions,
  getGameQuestionsQueryOptions,
} from '@/hooks/usegamequeries';

export const Route = createFileRoute('/_navbar-layout/_auth/e/games/$gameId')({
  loader: async ({ context: { queryClient }, params: { gameId } }) => {
    const [gameQuestionsQuery, gameQuery] = await Promise.all([
      queryClient.ensureQueryData(getGameQuestionsQueryOptions(gameId)),
      queryClient.ensureQueryData(getGameQueryOptions(gameId)),
    ]);
    return { gameQuestionsQuery, gameQuery };
  },
  component: () => <GameQuestionsPanel />,
});
