import React from 'react';
import { applyBacklightTwinkle } from '#/lib/backlight-twinkle';
import GameboardArtwork from '../../../assets/gameboard.svg?react';
import QuestionPanel from './QuestionPanel';
import TeamScore from './TeamScore';

export type GameBgProps = {
  board: React.ReactNode;
  leftTeam: number;
  rightTeam: number;
  overheadScore: number;
  question?: string;
  leftName?: React.ReactNode;
  rightName?: React.ReactNode;
} & React.ComponentProps<'svg'>;

const GameBg = ({
  board,
  leftTeam,
  rightTeam,
  overheadScore,
  question,
  leftName,
  rightName,
  ...props
}: GameBgProps) => {
  const svgRef = React.useRef<SVGSVGElement>(null);

  React.useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    return applyBacklightTwinkle(svg);
  }, []);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      viewBox="0 0 1920 1080"
      {...props}
      ref={svgRef}
    >
      <title>Funny Feud</title>
      <GameboardArtwork
        className="gameboard-artwork"
        width={1920}
        height={1080}
        aria-hidden="true"
        focusable="false"
      />

      <foreignObject x="584" y="345" width="752" height="390">
        {board}
      </foreignObject>
      <foreignObject x="55" y="447" width="310" height="186">
        <TeamScore score={leftTeam} />
      </foreignObject>
      <foreignObject x="1555" y="447" width="310" height="186">
        <TeamScore score={rightTeam} />
      </foreignObject>
      <foreignObject x="760" y="80" width="400" height="218">
        <TeamScore score={overheadScore} />
      </foreignObject>
      <foreignObject x="21" y="792" width="354" height="128">
        {leftName}
      </foreignObject>
      <foreignObject x="1542" y="792" width="354" height="128">
        {rightName}
      </foreignObject>
      {question ? (
        <foreignObject x="591" y="779" width="740" height="154">
          <QuestionPanel question={question} />
        </foreignObject>
      ) : null}
    </svg>
  );
};

export default GameBg;
