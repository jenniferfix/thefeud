import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { useNavigate, useParams, useRouter } from '@tanstack/react-router';
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetGame, useGetGameQuestions } from '@/hooks/usegamequeries';
import AddQuestionToGameDialog from './AddQuestionToGameDialog';
import Question from './Question';

const HeaderSection = ({ gameId }: { gameId: string }) => {
  const params = useParams({ from: '/_navbar-layout/_auth/e/games/$gameId' });
  const {
    history: { back },
  } = useRouter();
  const { data: gameData } = useGetGame(params.gameId);
  return (
    <div className="flex items-center justify-between border-b border-b-foreground/10 px-2 py-1">
      <div>{gameData?.name}</div>
      <Button variant="outline" size="icon" onClick={() => back()}>
        <ArrowLeftIcon />
      </Button>
    </div>
  );
};

const QuestionsPanel = () => {
  const params = useParams({ from: '/_navbar-layout/_auth/e/games/$gameId' });
  const { data: gameQuestions } = useGetGameQuestions(params.gameId);

  if (!gameQuestions) return <div>nothing here</div>;
  return (
    <div className="flex flex-col h-full w-full gap-2">
      <HeaderSection gameId={params.gameId} />
      <ScrollArea className="flex flex-col min-h-0 grow px-2">
        {gameQuestions.questions.map((q) => (
          <Question
            key={q.id}
            id={q.id}
            text={q.question ?? ''}
            editable={false}
            showAnswers={false}
          />
        ))}
      </ScrollArea>
      <div className="px-2 pb-3">
        <AddQuestionToGameDialog gameid={params.gameId} />
      </div>
    </div>
  );
};

export default QuestionsPanel;
