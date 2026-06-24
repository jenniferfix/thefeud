import { createFileRoute } from '@tanstack/react-router';
import { IsolatedGame } from '#/components/show/IsolatedGame';
import { getJoinCodeGameQueryOption } from '#/hooks/usejoincodes';
import { gameboardRouteURLPropsSchema } from '#/lib/schemas/gameboard';

export const Route = createFileRoute('/watch/$inviteCode')({
  validateSearch: gameboardRouteURLPropsSchema,
  loader: async ({ context: { queryClient }, params: { inviteCode } }) => {
    await Promise.allSettled([
      queryClient.ensureQueryData(getJoinCodeGameQueryOption(inviteCode)),
    ]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { isiframe } = Route.useSearch();
  const { inviteCode } = Route.useParams();

  return <IsolatedGame gameCode={inviteCode} isIframe={isiframe} />;
}
