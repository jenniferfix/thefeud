import { createFileRoute } from "@tanstack/react-router";
import QuestionPage from "@/components/gamecontrol/QuestionPage";
import { answersByQuestionIdQueryOptions } from "@/hooks/useanswerqueries";
import { getQuestionQueryOptions } from "@/hooks/usequestionqueries";

export const Route = createFileRoute("/_auth/c/$gameInstanceId/$questionId")({
  loader: async ({ context: { queryClient }, params }) => {
    const [questionQuery, answersQuery] = await Promise.all([
      queryClient.ensureQueryData(getQuestionQueryOptions(params.questionId)),
      queryClient.ensureQueryData(
        answersByQuestionIdQueryOptions(params.questionId),
      ),
    ]);
    return { questionQuery, answersQuery };
  },
  component: Page,
});

function Page() {
  const params = Route.useParams();
  return (
    <QuestionPage
      instanceId={params.gameInstanceId}
      questionId={params.questionId}
    />
  );
}
