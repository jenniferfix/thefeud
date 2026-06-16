import { ClientOnly, Link } from '@tanstack/react-router';
import { Binoculars, PlayIcon, X } from 'lucide-react';
import React from 'react';
import { useAuthenticatedUser } from '#/supabaseauth';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { WaitButton } from '@/components/ui/wait-button';
import {
  useGetActiveInstances,
  useGetUserInstances,
  useMarkInstanceFinished,
} from '@/hooks/useinstancequeries';

export const LocalDateTime = ({ value }: { value: string }) => {
  return (
    <time dateTime={value}>
      {new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))}
    </time>
  );
};

const FinishedButton = ({ gameInstanceId }: { gameInstanceId: string }) => {
  const markFinished = useMarkInstanceFinished();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <WaitButton
          loading={markFinished.isPending}
          disabled={markFinished.isPending || markFinished.isError}
          variant="ghost"
          size="icon"
          onClick={() => {
            markFinished.mutate({ gameInstanceId });
          }}
        >
          <X />
        </WaitButton>
      </TooltipTrigger>
      <TooltipContent>Mark game as finished</TooltipContent>
    </Tooltip>
  );
};

const ActiveGames = ({ userid }: { userid?: string }) => {
  const { user } = useAuthenticatedUser();
  const { data, error, isError, isLoading } = useGetUserInstances(
    user.id,
    false,
  );
  const markFinished = useMarkInstanceFinished();
  if (isLoading) return <div>Loading</div>;
  if (isError) return <div>Error: {error.message}</div>;

  if (!data?.length) return null;
  return (
    <div className="my-12">
      <h3 className="text-center my-4 text-2xl font-semibold">
        Your active games
      </h3>
      {!data?.length && (
        <div className="h-[100px] flex justify-center items-center">
          Nothing here :(
        </div>
      )}

      {data?.map((d) => (
        <div key={d.id} className="grid grid-cols-[1fr_auto_auto]">
          <div className="self-center mr-3">{d.games?.name}</div>
          <div className="self-center mx-3">
            <ClientOnly>
              <LocalDateTime value={d.created_at} />
            </ClientOnly>
          </div>
          <ButtonGroup className="self-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild>
                  <Link
                    to={`/g/$gameInstanceId`}
                    params={{ gameInstanceId: d.id }}
                  >
                    <Binoculars />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Watch game</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild>
                  <Link
                    to={`/c/$gameInstanceId`}
                    params={{ gameInstanceId: d.id }}
                  >
                    <PlayIcon />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Host Controller</TooltipContent>
            </Tooltip>
            <FinishedButton gameInstanceId={d.id} />
          </ButtonGroup>
        </div>
      ))}
    </div>
  );
};

export default ActiveGames;
