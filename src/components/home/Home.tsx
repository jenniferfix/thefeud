import { animated, useSpring } from '@react-spring/web';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import React from 'react';
import ActiveGames from '@/components/ActiveGames';
import StartGame from '@/components/gamecontrol/SelectAndStart';
import { Button } from '@/components/ui/button';
import { getUserGamesQueryOptions } from '@/hooks/usegamequeries';
import { useSupabaseAuth } from '@/supabaseauth';

const GoButton = ({ children }: { children: React.ReactNode }) => {
  return <Button className="h-12 text-lg font-semibold">{children}</Button>;
};

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
    <div className="px-4">
      <div className="my-4 mx-2">
        <animated.h1 style={springProps} className="text-4xl">
          Welcome to The Feud
        </animated.h1>
      </div>

      <section className="flex gap-12 my-12 justify-center">
        <GoButton>Go to your games!</GoButton>
        <GoButton>Go to the question builder!</GoButton>
      </section>

      <section className="my-4">
        <div>
          <h2 className="text-lg font-semibold">
            Welcome to Feud. A Family Feud themed game that you host.
          </h2>
          <p>
            Start by adding your own questions and answers. You have your own
            permanent question bank to keep adding to and reusing if you would
            like.
          </p>
          <p>
            Create and name your episode. Add your question rounds to the
            episode. Play!
          </p>
          <p>
            You can keep the game round you build up as well. Replay with
            different groups or archive it.
          </p>
          <p>
            You will be given a link when you start the episode. You can also
            click the "active episode" button that will show up when your
            episode is active. Optionally you can use a QR to load on another
            device.
          </p>
        </div>
      </section>
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
