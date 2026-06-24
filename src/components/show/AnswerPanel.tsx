import { animated, useSpring } from '@react-spring/web';
import { Answer } from '#/lib/schemas/gameboard';

const AnswerPanel = ({
  answer,
  flipped,
  points,
  order,
}: {
  answer: string;
  points: number;
  flipped: boolean;
  order?: number;
}) => {
  const { transform, opacity } = useSpring({
    opacity: flipped ? 1 : 0,
    transform: `perspective(200px) rotateX(${flipped ? 0 : 180}deg)`,
    config: {
      mass: 5,
      tension: 500,
      friction: 80,
    },
  });
  return (
    <div className="relative border m-2 h-20 bg-linear-to-b from-[#1182f6] to-[#594cc3]">
      <animated.div
        className="absolute flex justify-between h-full w-full items-center"
        style={{
          transform,
          opacity,
        }}
      >
        <div
          className="text-3xl font-semibold text-white uppercase grow bg-black h-full w-full flex items-center justify-center bg-linear-to-b  from-blue-900 to-indigo-950"
          style={{ textShadow: '5px 5px black' }}
        >
          {answer}
        </div>
        <div //TODO: Make sure this stays the same width, it currently follows text width and single digit scores look bad
          className="flex text-5xl font-medium text-white p-2 w-20 justify-center"
          style={{ textShadow: '4px 4px black' }}
        >
          {points}
        </div>
      </animated.div>
      <animated.div
        className="absolute w-full flex justify-center h-full items-center"
        style={{
          rotateX: '180deg',
          transform,
          opacity: opacity.to((o) => 1 - o),
        }}
      >
        {order && (
          <div className="border-2 rounded-full aspect-square flex justify-center items-center h-12 text-3xl">
            {order}
          </div>
        )}
      </animated.div>
    </div>
  );
};

export default AnswerPanel;
