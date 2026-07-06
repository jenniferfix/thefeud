import { CopyButton } from '../CopyButton';

export interface ShowJoinCodeProps {
  joinCode?: string | null;
}

export const ShowJoinCode = ({ joinCode }: ShowJoinCodeProps) => {
  return (
    <div className="flex justify-between">
      <div className="text-4xl font-semibold">{joinCode}</div>
      <div className="flex">
        <CopyButton copyValue={joinCode} />
      </div>
    </div>
  );
};
