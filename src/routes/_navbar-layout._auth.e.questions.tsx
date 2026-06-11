import {
  createFileRoute,
  Outlet,
  useRouterState,
} from '@tanstack/react-router';
import * as React from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '#/components/ui/resizable';
import Questions from '@/components/editor/Questions';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { getUserQuestionsQueryOptions } from '@/hooks/usequestionqueries';

export const Route = createFileRoute('/_navbar-layout/_auth/e/questions')({
  //loader: async ({ context: { queryClient, session } }) => {
  // TODO: Fix the problem with not having the user.id on the first render
  // (hence no data query possible here)
  // return await queryClient.ensureQueryData(
  //   questionsQueryOptions(auth?.user?.id!),
  // );
  //},
  component: () => <QuestionsLayout />,
});

function QuestionsLayout() {
  const location = useRouterState({ select: (state) => state.location });
  const isMobile = useMediaQuery({ query: '(max-width: 767px)' });
  const isQuestionRoute = location.pathname.includes('/questions/');

  if (isMobile) {
    if (isQuestionRoute) {
      return <Outlet />;
    } else {
      return <Questions />;
    }
  } else {
    return (
      <ResizablePanelGroup>
        <ResizablePanel defaultSize={25}>
          <Questions />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75}>
          <Outlet />
        </ResizablePanel>
      </ResizablePanelGroup>
    );
  }
}
