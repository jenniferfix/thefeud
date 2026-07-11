import { CircleCheck, Copy } from 'lucide-react';
import { useCopyToClipboard } from '#/hooks/useCopyToClipboard';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type CopyOption = {
  label: string;
  // A function defers building the value (e.g. from window.location) until
  // the user picks the option, keeping render SSR-safe.
  value: string | (() => string);
};

export const CopyButton = ({
  options,
  label = 'Copy game information',
}: {
  options: CopyOption[];
  label?: string;
}) => {
  const { copy, isCopied } = useCopyToClipboard();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={options.length === 0}>
        <Button
          size="icon"
          variant="ghost"
          aria-label={label}
          className="self-center"
        >
          {isCopied ? <CircleCheck /> : <Copy />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-max">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.label}
            onSelect={() => {
              copy(
                typeof option.value === 'function'
                  ? option.value()
                  : option.value,
              );
            }}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
