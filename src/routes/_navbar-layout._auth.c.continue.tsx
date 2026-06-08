import { createFileRoute } from "@tanstack/react-router";
import ContinueGamePage from "@/components/gamecontrol/ContinueGamePage";
import { getUserInstancesQueryOptions } from "@/hooks/useinstancequeries";

export const Route = createFileRoute("/_navbar-layout/_auth/c/continue")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      getUserInstancesQueryOptions(context.auth?.user?.id || ""),
    );
  },
  component: () => <Page />,
});

const Page = () => {
  return <ContinueGamePage />;
};
