'use client';
import { PlayIcon } from '@radix-ui/react-icons';
import { ClientOnly, Link } from '@tanstack/react-router';
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetActiveInstances } from '@/hooks/useinstancequeries';

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

const ActiveGames = ({ userid }: { userid?: string }) => {
  const { data, error, isError, isLoading } = useGetActiveInstances();
  if (isLoading) return <div>Loading</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div className="my-12">
      <h3 className="text-center my-4 text-2xl font-semibold">Public games</h3>
      <ScrollArea className="h-[200px] bg-card/20 rounded">
        {!data?.length && (
          <div className="h-[200px] flex justify-center items-center">
            Nothing here :(
          </div>
        )}
        {data?.map((d) => (
          <div key={d.id}>
            <Button variant="link" asChild>
              <Link to={`/g/$gameInstanceId`} params={{ gameInstanceId: d.id }}>
                {d.games?.name} started{' '}
                <ClientOnly>
                  <LocalDateTime value={d.created_at} />
                </ClientOnly>
              </Link>
            </Button>
            {userid && userid === d.userid && (
              <Button variant="ghost" size="icon" asChild>
                <Link
                  to={`/c/$gameInstanceId`}
                  params={{ gameInstanceId: d.id }}
                >
                  <PlayIcon />
                </Link>
              </Button>
            )}
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default ActiveGames;
