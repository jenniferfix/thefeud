import { animated, useSpring } from '@react-spring/web';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import React from 'react';
import { cn } from '#/lib/utils';
import ActiveGames from '@/components/ActiveGames';
import StartGame from '@/components/gamecontrol/SelectAndStart';
import { Button, buttonVariants } from '@/components/ui/button';
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
}: { children: React.ReactNode } & React.ComponentProps<'span'>) => {
  return (
    <div className="whitespace-nowrap">
      <span
        className={cn(
          'inline-block tracking-wider first-letter:float-left first-letter:ml-4  first-letter:-mt-2 first-letter:text-6xl feudtext',
          className,
        )}
        {...props}
      >
        {children}
      </span>
    </div>
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
      <div className="mb-8 mt-6 flex justify-center">
        <div className="w-100">
          <img
            src="/images/familyfeud.svg"
            width={1416}
            height={816}
            title="Family Feud"
            className="mx-auto"
          />
        </div>
        {/* <animated.h1 style={springProps} className="text-4xl"> */}
        {/* </animated.h1> */}
      </div>

      <section className="flex flex-col sm:flex-row gap-12 my-12 justify-center">
        <Link
          to={'/games'}
          className={buttonVariants({
            className: 'h-12 text-lg font-semibold mx-4 sm:mx-0',
          })}
        >
          Go to your games!
        </Link>
        <Link
          to={'/questions'}
          className={buttonVariants({
            className: 'h-12 text-lg font-semibold mx-4 sm:mx-0',
          })}
        >
          Go to your questions!
        </Link>
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
      <div>
        <ActiveGames userid={auth.user?.id} />
      </div>
    </div>
  );
}
