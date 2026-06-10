import { createFileRoute } from '@tanstack/react-router';
import EditorAnswers from '@/components/editor/EditorAnswers';
import { getAnswersByQuestionIdQueryOptions } from '@/hooks/useanswerqueries';
import { getQuestionQueryOptions } from '@/hooks/usequestionqueries';

export const Route = createFileRoute(
  '/_navbar-layout/_auth/e/questions/$questionId',
)({
  loader: async ({ context: { queryClient }, params: { questionId } }) => {
    const [questionQuery, answersQuery] = await Promise.all([
      queryClient.ensureQueryData(getQuestionQueryOptions(questionId)),
      queryClient.ensureQueryData(
        getAnswersByQuestionIdQueryOptions(questionId),
      ),
    ]);
    return { questionQuery, answersQuery };
  },
  component: () => <EditorAnswers />,
});
