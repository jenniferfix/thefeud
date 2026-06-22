import { ExpandIcon, ShrinkIcon } from 'lucide-react';
import React from 'react';
import Confetti from 'react-confetti';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { useWindowSize } from '#/hooks/useWindowSize';
import GameBg from '@/components/show/GameBg';
import { Button } from '@/components/ui/button';
import type { ConfettiMode } from '@/hooks/useFeudEvents';
import useFeudEvents from '@/hooks/useFeudEvents';
import { cn } from '@/utils/utils';
import Gameboard from './Gameboard';
import Strike from './Strike';

const TeamName = ({ value }: { value: string }) => {
  const long = value.length >= 11;
  return (
    <div
      data-long={long}
      className="w-full h-full flex items-center justify-center text-5xl data-[long=true]:text-4xl text-yellow-lt"
    >
      {value}
    </div>
  );
};

const ConfettiDiv = React.memo(({ mode }: { mode: ConfettiMode }) => {
  const { width, height } = useWindowSize();
  const [animate, setAnimate] = React.useState(mode !== 'disabled');

  const confettiWidth = React.useMemo(
    () => (mode === 'left' || mode === 'right' ? width / 2 : width),
    [mode, width],
  );

  React.useEffect(() => {
    if (mode !== 'disabled') return;

    const timer = setTimeout(() => {
      setAnimate(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [mode]);

  return (
    <div
      className={cn(
        'absolute top-0 bottom-0 pointer-events-none transition-opacity duration-200 overflow-hidden',
        mode === 'disabled' ? 'opacity-0' : 'opacity-100',
        mode === 'full' ? 'left-0 right-0' : '',
        mode === 'left' ? `left-0 right-1/2` : '',
        mode === 'right' ? `left-1/2 right-0` : '',
      )}
    >
      <Confetti
        width={confettiWidth}
        height={height}
        run={animate}
        numberOfPieces={100}
      />
    </div>
  );
});

const Game = ({
  instanceId,
  isIframe = false,
}: {
  instanceId: string;
  isIframe?: boolean;
}) => {
  const {
    isLoading,
    // isError,
    answers,
    answered,
    leftTeamScore,
    rightTeamScore,
    roundScore,
    showStrike,
    strikes,
    currentQuestionText,
    rightName,
    leftName,
    confettiMode,
  } = useFeudEvents({ instanceId, sound: true });
  const fullscreen = useFullScreenHandle();

  if (isLoading) return <div>Loading...</div>;

  const handleFullscreenClick = () => {
    if (fullscreen.active) {
      fullscreen.exit();
    } else {
      fullscreen.enter();
    }
  };

  return (
    <FullScreen handle={fullscreen}>
      <ConfettiDiv mode={confettiMode} />
      <GameBg
        className="h-screen w-screen object-contain pointer-events-none select-none p-2"
        board={<Gameboard answers={answers} answered={answered} />}
        leftTeam={leftTeamScore}
        rightTeam={rightTeamScore}
        overheadScore={roundScore}
        question={currentQuestionText}
        leftName={<TeamName value={leftName?.toUpperCase() ?? ''} />}
        rightName={<TeamName value={rightName?.toUpperCase() ?? ''} />}
      />
      {showStrike && <Strike count={strikes} />}
      <div
        className={cn(
          'absolute top-2 right-2',
          fullscreen.active ? 'text-muted' : '',
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFullscreenClick}
          className={cn(
            isIframe
              ? 'opacity-0 pointer-events-none'
              : 'opacity-100 pointer-events-auto',
          )}
        >
          {fullscreen.active ? <ShrinkIcon /> : <ExpandIcon />}
        </Button>
      </div>
    </FullScreen>
  );
};

export default Game;
