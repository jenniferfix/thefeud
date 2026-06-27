import { createFileRoute } from '@tanstack/react-router';
import { getUserInstancesQueryOptions } from '#/hooks/useinstancequeries';
import { Home } from '@/components/home/Home';
import { getAllGamesQueryOptions } from '@/hooks/usegamequeries';

export const Route = createFileRoute('/_navbar-layout/')({
  loader: async ({ context: { auth, queryClient, supabase } }) => {
    if (!auth?.user) return;
    // console.log(auth?.user?.id);
    await Promise.all([
      queryClient.ensureQueryData(getAllGamesQueryOptions(supabase)),
      queryClient.ensureQueryData(
        getUserInstancesQueryOptions(supabase, auth.user.id, false),
      ),
    ]);
  },
  component: HomeComponent,
});

function HomeComponent() {
  return <Home />;
}
