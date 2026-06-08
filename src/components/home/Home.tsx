import { animated, useSpring } from '@react-spring/web';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import React from 'react';
import ActiveGames from '@/components/ActiveGames';
import StartGame from '@/components/gamecontrol/SelectAndStart';
import { getUserGamesQueryOptions } from '@/hooks/usegamequeries';
import { useSupabaseAuth } from '@/supabaseauth';

export default function Index() {
  const auth = useSupabaseAuth();
  // console.log(auth?.user?.id);
  const springProps = useSpring({
    from: { opacity: 0 },
    opacity: 1,
    config: {
      duration: 1200,
    },
  });

  return (
    <div>
      <div className="my-4 mx-2">
        <animated.h1 style={springProps} className="text-4xl">
          Welcome to The Feud
        </animated.h1>
      </div>
      <div className="flex gap-4">
        {auth.isAuthenticated && (
          <div>
            <div>
              <Link to="/e">Go to your editor</Link>
            </div>
            <div>Start a game</div>
            {auth?.user?.id && (
              <div>
                <h3>Your games</h3>
                <StartGame />
              </div>
            )}
          </div>
        )}
      </div>
      <div>
        <h3>Public games</h3>
        <ActiveGames userid={auth.user?.id} />
      </div>
    </div>
  );
}
