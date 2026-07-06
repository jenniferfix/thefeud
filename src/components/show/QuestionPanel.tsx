const QuestionPanel = ({ question }: { question: string }) => {
  return (
    <div
      className="w-full h-full flex justify-center items-center uppercase text-5xl drop-shadow text-white team-score-shadow"
      style={{ textShadow: '5px 5px black' }}
    >
      {question}
    </div>
  );
};

export default QuestionPanel;
