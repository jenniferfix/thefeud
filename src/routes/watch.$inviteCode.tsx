import { createFileRoute } from '@tanstack/react-router';
import { IsolatedGame } from '#/components/show/IsolatedGame';
import { RealtimeViewerGate } from '#/components/show/RealtimeViewerGate';
import { getJoinCodeGameQueryOption } from '#/hooks/usejoincodes';
import { gameboardRouteURLPropsSchema } from '#/lib/schemas/gameboard';

export const Route = createFileRoute('/watch/$inviteCode')({
  validateSearch: gameboardRouteURLPropsSchema,
  loader: async ({ context: { queryClient }, params: { inviteCode } }) => {
    await Promise.all([
      queryClient.ensureQueryData(getJoinCodeGameQueryOption(inviteCode)),
    ]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { isiframe } = Route.useSearch();
  const { inviteCode } = Route.useParams();

  return (
    <RealtimeViewerGate code={inviteCode}>
      <IsolatedGame gameCode={inviteCode} isIframe={isiframe} />
    </RealtimeViewerGate>
  );
}
