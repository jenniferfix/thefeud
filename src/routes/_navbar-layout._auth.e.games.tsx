import {
  createFileRoute,
  Outlet,
  useRouterState,
} from '@tanstack/react-router';
import React from 'react';
import Games from '@/components/editor/Games';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { getUserGamesQueryOptions } from '@/hooks/usegamequeries';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export const Route = createFileRoute('/_navbar-layout/_auth/e/games')({
  loader: ({ context }) => {
    // return context.queryClient.ensureQueryData(
    //   getUserGamesQueryOptions(context.auth?.user?.id!),
    // );
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
      <ResizablePanelGroup
        direction="horizontal"
        autoSaveId="gamespanels"
        tagName="main"
      >
        <ResizablePanel tagName="section" defaultSize={25}>
          <Games />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel tagName="section" defaultSize={75}>
          <Outlet />
        </ResizablePanel>
      </ResizablePanelGroup>
    );
  }
};
