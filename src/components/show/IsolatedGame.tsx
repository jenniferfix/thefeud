import { ClientOnly, useNavigate } from '@tanstack/react-router';
import { ExpandIcon, ShrinkIcon } from 'lucide-react';
import React from 'react';
import Confetti from 'react-confetti';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { useIsolatedViewer } from '#/hooks/useIsolatedViewer';
import { useWindowSize } from '#/hooks/useWindowSize';
import type { ConfettiMode } from '#/lib/schemas/game';
import GameBg from '@/components/show/GameBg';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/utils';
import { Winner } from '../Winner';
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
    if (mode !== 'disabled') {
      setAnimate(true);
      return;
    }

    const timer = setTimeout(() => {
      setAnimate(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [mode]);

  return (
    <div
      className={cn(
        'absolute top-0 bottom-0 pointer-events-none transition-opacity duration-200 overflow-hidden z-10',
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

export const IsolatedGame = ({
  gameCode,
  isIframe = false,
}: {
  gameCode: string;
  isIframe?: boolean;
}) => {
  const fullscreen = useFullScreenHandle();
  const navigate = useNavigate();
  const {
    strikes,
    showStrikes,
    questionText,
    leftTeam,
    rightTeam,
    rightScore,
    roundScore,
    answers,
    leftScore,
    confettiMode,
    gameover,
  } = useIsolatedViewer(gameCode);

  const handleFullscreenClick = () => {
    if (fullscreen.active) {
      fullscreen.exit();
    } else {
      fullscreen.enter();
    }
  };

  const winnerName =
    leftScore > rightScore ? leftTeam : rightScore > leftScore ? rightTeam : '';

  return (
    <FullScreen handle={fullscreen}>
      <ClientOnly>
        <ConfettiDiv mode={confettiMode} />
      </ClientOnly>
      <GameBg
        className="h-screen w-screen object-contain pointer-events-none select-none p-2"
        board={<Gameboard answers={answers} />}
        leftTeam={leftScore ?? 0}
        rightTeam={rightScore ?? 0}
        overheadScore={roundScore ?? 0}
        question={questionText ?? ''}
        leftName={<TeamName value={leftTeam?.toUpperCase() ?? ''} />}
        rightName={<TeamName value={rightTeam?.toUpperCase() ?? ''} />}
      />
      {showStrikes && <Strike count={strikes} />}
      {gameover &&
        (isIframe ? (
          <div className="absolute inset-0 z-20">
            <Winner
              className="h-screen w-screen object-contain pointer-events-none select-none"
              teamName={winnerName.toUpperCase()}
              aria-hidden="true"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate({ to: '/' })}
            aria-label="Return to home"
            className="absolute inset-0 z-20 cursor-pointer"
          >
            <Winner
              className="h-screen w-screen object-contain pointer-events-none select-none"
              teamName={winnerName.toUpperCase()}
              aria-hidden="true"
            />
          </button>
        ))}
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
