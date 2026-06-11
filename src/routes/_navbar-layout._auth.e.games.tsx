import {
  createFileRoute,
  Outlet,
  useRouterState,
} from '@tanstack/react-router';
import Games from '@/components/editor/Games';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { getUserGamesQueryOptions } from '@/hooks/usegamequeries';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export const Route = createFileRoute('/_navbar-layout/_auth/e/games')({
  loader: async ({ context: { queryClient, user } }) => {
    await Promise.allSettled([
      queryClient.ensureQueryData(getUserGamesQueryOptions(user.id)),
    ]);
  },
  component: () => <EditorLayout />,
});
const EditorLayout = () => {
  const location = useRouterState({ select: (state) => state.location });
  const isMobile = useMediaQuery({ query: '(max-width: 767px)' });
  const isGameRoute = location.pathname.includes('/games/');

  if (isMobile) {
    if (isGameRoute) {
      return <Outlet />;
    } else {
      return <Games />;
    }
  } else {
    return (
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize={25}>
          <Games />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75}>
          <Outlet />
        </ResizablePanel>
      </ResizablePanelGroup>
    );
  }
};
