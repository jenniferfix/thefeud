import { ExpandIcon, ShrinkIcon } from 'lucide-react';
import React from 'react';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import GameBg from '@/components/show/GameBg';
import { Button } from '@/components/ui/button';
import { Tables } from '@/types/supabase.types';
import { cn } from '@/utils/utils';
import Gameboard from './Gameboard';
import Strike from './Strike';

type TEvents = Tables<'game_events'>;

import useFeudEvents from '@/hooks/useFeudEvents';

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

const Game = ({ instanceId }: { instanceId: string }) => {
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
    currentQuestion,
    currentQuestionText,
    rightName,
    leftName,
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
    <React.Fragment>
      <FullScreen handle={fullscreen}>
        <GameBg
          className="h-screen w-screen object-contain pointer-events-none select-none"
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
          <Button variant="ghost" size="icon" onClick={handleFullscreenClick}>
            {fullscreen.active ? <ShrinkIcon /> : <ExpandIcon />}
          </Button>
        </div>
      </FullScreen>
    </React.Fragment>
  );
};

export default Game;
