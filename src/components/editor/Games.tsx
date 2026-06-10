import { Pencil1Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { getRouteApi, Link } from '@tanstack/react-router';
import { useSelector } from '@tanstack/react-store';
import React from 'react';
import { z } from 'zod';
import type { GetUserGamesType } from '#/queries/gamequeries';
import { gameNameField } from '#/types/auth';
import { Button } from '@/components/ui/button';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from '@/components/ui/item';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppForm } from '@/components/ui/tanstack-form';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Waiting } from '@/components/ui/waiting';
import { WarningDialog } from '@/components/ui/warning';
import {
  useDeleteGame,
  useGetUserGames,
  useInsertGame,
  useUpdateGame,
} from '@/hooks/usegamequeries';
import { cn } from '@/utils/utils';

const InsertGameForm = () => {
  const insertGame = useInsertGame();

  const form = useAppForm({
    defaultValues: {
      name: '',
    },
    validators: { onSubmit: z.object({ name: gameNameField }) },
    onSubmit: async ({ formApi, value: { name } }) => {
      name = name.trim();
      if (name.length) return;
      insertGame.mutate({ name });
      formApi.reset();
    },
  });

  const handleSubmit = React.useCallback(
    (e: React.SubmitEvent) => {
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit();
    },
    [form],
  );

  return (
    <form.AppForm>
      <form onSubmit={handleSubmit} className="flex">
        <form.AppField
          name="name"
          children={(field) => (
            <field.Field>
              <field.Input variant="list" placeholder="Game Name" />
            </field.Field>
          )}
        />
        <Button type="submit" variant="ghost" size="icon">
          <PlusIcon />
        </Button>
      </form>
    </form.AppForm>
  );
};

const GameEditField = ({
  editing = false,
  setEditing,
  gameId,
  name,
  onFinished,
}: {
  editing?: boolean;
  setEditing?: (editing: boolean) => void;
  gameId: string;
  name: string;
  onFinished?: () => void;
}) => {
  const updateGame = useUpdateGame();
  const form = useAppForm({
    defaultValues: {
      name,
    },
    validators: {},
    onSubmit: async ({ value: { name } }) => {
      console.log('submit');
      onFinished?.();
      await updateGame.mutateAsync({ gameId: gameId, name });
    },
  });

  const isDirty = useSelector(
    form.store,
    (state) => state.fieldMeta.name?.isDirty,
  );

  const handleBlur = React.useCallback(() => {
    if (!isDirty) onFinished?.();
    form.handleSubmit();
  }, [form]);

  return (
    <form.AppForm>
      <form
        className="w-full"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        onBlur={handleBlur}
      >
        <form.AppField
          name="name"
          children={(field) => (
            <field.Field className="w-full p-0">
              <Tooltip>
                <TooltipTrigger>
                  <field.InputGroup
                    className={cn(
                      'bg-accent text-accent-foreground border-0 p-0 w-full',
                      isDirty ? 'ring-amber-500' : '',
                    )}
                  >
                    <field.InputGroupInput
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </field.InputGroup>
                </TooltipTrigger>
                <TooltipContent>Click to edit name</TooltipContent>
              </Tooltip>
            </field.Field>
          )}
        />
      </form>
    </form.AppForm>
  );
};

const Game = ({ game }: { game: GetUserGamesType }) => {
  const [editing, setEditing] = React.useState(false);
  const deleteGame = useDeleteGame();

  const handleDelete = React.useCallback(() => {
    deleteGame.mutate({ gameId: game?.id! });
  }, [deleteGame.mutate]);

  const toggleEditing = React.useCallback(() => {
    setEditing((prev) => !prev);
  }, []);

  return (
    <Link to="/e/games/$gameId" params={{ gameId: game.id }}>
      <Item className="hover:bg-accent/50">
        <ItemContent>
          <ItemTitle className="w-full p-0">
            <GameEditField
              editing={editing}
              setEditing={setEditing}
              gameId={game.id}
              name={game.name ?? ''}
              onFinished={() => setEditing(false)}
            />
          </ItemTitle>
          <ItemDescription>
            {!game.questions.length && 'Click to edit and add questions'}
            {game.questions.map((q) => (
              <span key={q.id}>{q.question}</span>
            ))}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <div className="flex items-center">
            <Button size="icon" variant="ghost" onClick={toggleEditing}>
              <Pencil1Icon />
            </Button>
            <WarningDialog onClick={handleDelete}>
              <Button
                size="icon"
                variant="ghost"
                disabled={deleteGame.isPending}
              >
                {deleteGame.isPending ? <Waiting /> : <TrashIcon />}
              </Button>
            </WarningDialog>
          </div>
        </ItemActions>
      </Item>
    </Link>
  );
};

const Games = () => {
  const { session } = getRouteApi(
    '/_navbar-layout/_auth/e/games',
  ).useRouteContext();
  const gameQuery = useGetUserGames(session.user.id);
  // const gamesQuery = useSuspenseQuery(
  //   getUserGamesQueryOptions(auth?.user?.id!),
  // );
  const games = gameQuery.data;

  return (
    <div className="flex flex-col justify-between h-full w-full gap-2 pt-3 px-2">
      <ScrollArea className="h-1 grow">
        {games?.map((g) => (
          <Game key={g.id} game={g} />
        ))}
      </ScrollArea>
      <InsertGameForm />
    </div>
  );
};
export default Games;
