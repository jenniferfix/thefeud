import { animated, useSpring } from '@react-spring/web';
import { Link } from '@tanstack/react-router';
import React from 'react';
import { cn } from '#/lib/utils';
import ActiveGames from '@/components/ActiveGames';
import { Button, buttonVariants } from '@/components/ui/button';
import { useSupabaseAuth } from '@/supabaseauth';
import { InputCodeField } from '../InputCodeField';

export function Home() {
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
    <div className="px-4 flex flex-col">
      <div className="mb-8 mt-6 flex justify-center">
        <div className="w-100">
          <img
            src="/images/funnyfeud.svg"
            width={1416}
            height={816}
            title="Family Feud"
            className="mx-auto"
          />
        </div>
        {/* <animated.h1 style={springProps} className="text-4xl"> */}
        {/* </animated.h1> */}
      </div>

      {auth?.user && (
        <>
          <ActiveGames userid={auth.user?.id} />
          <section className="flex flex-col md:flex-row gap-12 my-12 justify-center items-center">
            <Link
              to={'/games'}
              className={buttonVariants({
                className: 'h-12 text-lg font-semibold w-full md:w-sm',
              })}
            >
              Go to your games!
            </Link>
            <Link
              to={'/questions'}
              className={buttonVariants({
                className: 'h-12 text-lg font-semibold w-full md:w-sm',
              })}
            >
              Go to your questions!
            </Link>
          </section>
        </>
      )}

      <InputCodeField />

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
        <div>
          <h2>Editor</h2>
          <h3>How it works</h3>
          <p>
            The game editor is where you will build up your individual games.
          </p>
          <p>
            A game can can consist of multiple rounds (questions), that you can
            build up in any order you wish.
          </p>
          <p>
            Each question can have up to eight (8) answers that you will have to
            manually add the details of.
          </p>
          <p>
            You can build a permanent list of questions and answers that you can
            use in multiple games if you want to host different groups. Then add
            as needed to your different games.
          </p>
        </div>
      </section>
    </div>
  );
}
