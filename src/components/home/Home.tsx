import { animated, useSpring } from '@react-spring/web';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import React from 'react';
import { cn } from '#/lib/utils';
import ActiveGames from '@/components/ActiveGames';
import StartGame from '@/components/gamecontrol/SelectAndStart';
import { Button } from '@/components/ui/button';
import { getUserGamesQueryOptions } from '@/hooks/usegamequeries';
import { useSupabaseAuth } from '@/supabaseauth';

const GoButton = ({
  children,
  className,
  ...props
}: { children: React.ReactNode } & React.ComponentProps<typeof Button>) => {
  return (
    <Button
      className={cn('h-12 text-lg font-semibold mx-4 sm:mx-0', className)}
      {...props}
    >
      {children}
    </Button>
  );
};

const Wrap = ({
  children,
  className,
  ...props
}: { children: React.ReactNode } & React.ComponentProps<'div'>) => {
  return (
    <span className="whitespace-nowrap">
      <div
        className={cn(
          'tracking-wide first-letter:float-left first-letter:ml-4  first-letter:-mt-2 first-letter:text-6xl font-bold',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </span>
  );
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
      <div className="my-10 text-center relative">
        {/* <animated.h1 style={springProps} className="text-4xl"> */}
        <svg
          viewBox="0 0 240 120"
          className="inline-block w-[240px] h-[120px] absolute -z-10 fill-feudblue"
        >
          <ellipse cx={120} cy={60} rx={120} ry={60} />
        </svg>
        <h1 className="translate-y-4 translate-x-4 relative text-4xl inline-block">
          <Wrap>
            FAMIL<span className="float-right text-5xl -my-2.5">y</span>
          </Wrap>
          <Wrap className="">FEUD</Wrap>
        </h1>
        {/* </animated.h1> */}
      </div>

      <section className="flex flex-col sm:flex-row gap-12 my-12 justify-center">
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
