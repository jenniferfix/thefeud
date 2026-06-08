"use client";
import { ExpandIcon, ShrinkIcon } from "lucide-react";
import React from "react";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import GameBg from "@/components/show/GameBg";
import { Button } from "@/components/ui/button";
import { Tables } from "@/types/supabase.types";
import { cn } from "@/utils/utils";
import Gameboard from "./Gameboard";
import Strike from "./Strike";

type TEvents = Tables<"game_events">;

import useFeudEvents from "@/hooks/useFeudEvents";

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
          className="h-screen w-screen object-contain"
          board={<Gameboard answers={answers} answered={answered} />}
          leftTeam={leftTeamScore}
          rightTeam={rightTeamScore}
          overheadScore={roundScore}
          question={currentQuestionText}
        />
        {showStrike && <Strike count={strikes} />}
        <div
          className={cn(
            "absolute top-2 right-2",
            fullscreen.active ? "text-muted" : "",
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
