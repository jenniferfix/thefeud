/** biome-ignore-all lint/suspicious/noArrayIndexKey: legacy code */
import type { AnswerRecord } from '#/lib/schemas/gameboard';
import AnswerPanel from './AnswerPanel';

const Gameboard = ({
  answers,
}: {
  answers: AnswerRecord;
}): React.ReactElement => {
  if (!answers) {
    // answers = [{ id: '1', answer: 'Answer1', score: 0 }];
  }

  const ans = Object.values(answers);

  return (
    <div className="grid grid-cols-2 grid-rows-4 grid-flow-col h-full">
      {ans.map((i, index) => (
        <AnswerPanel
          key={`answerpanel + ${index}`}
          answer={i?.text ?? ''}
          flipped={!!i}
          points={i?.score ?? 0}
          order={index + 1}
        />
      ))}
      {Array.from({ length: 8 - ans.length }, (_e, i) => (
        <AnswerPanel key={`ap + ${i}`} answer={''} flipped={false} points={0} />
      ))}
    </div>
  );
};

export default Gameboard;
