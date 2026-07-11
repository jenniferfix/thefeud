import { CopyButton, type CopyOption } from '../CopyButton';

export interface ShowJoinCodeProps {
  joinCode?: string | null;
}

export const ShowJoinCode = ({ joinCode }: ShowJoinCodeProps) => {
  // TODO: What if there is no joinCode then what
  const options: CopyOption[] = joinCode
    ? [
        { label: 'Copy game code', value: joinCode },
        {
          label: 'Copy viewer URL',
          value: () =>
            `${window.location.origin}/watch/${encodeURIComponent(joinCode)}`,
        },
      ]
    : [];

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs text-muted-foreground">Game code</div>
      <div className="flex justify-between">
        <div className="text-4xl font-semibold">{joinCode}</div>
        <CopyButton options={options} />
      </div>
    </div>
  );
};
