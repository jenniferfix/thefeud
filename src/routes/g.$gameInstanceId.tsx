import { createFileRoute } from '@tanstack/react-router';
import { gameboardRouteURLPropsSchema } from '#/lib/schemas/gameboard';
import Game from '@/components/show/Game';

export const Route = createFileRoute('/g/$gameInstanceId')({
  validateSearch: gameboardRouteURLPropsSchema,
  component: ControlComponent,
});

function ControlComponent() {
  const { isiframe } = Route.useSearch();
  const gameInstanceId = Route.useParams().gameInstanceId;

  return <Game instanceId={gameInstanceId} isIframe={isiframe} />;
}
