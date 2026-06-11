import { ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type SortOrder = 'asc' | 'desc';

export type SortColumn = 'created' | 'question' | 'num_answers';

export type SortOpts = {
  column: SortColumn;
  order?: SortOrder;
};

export type SortControlProps = {
  onSortChange?: (opts: SortOpts[]) => void;
  sort?: SortOpts;
};

export const SortControl = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Sort by</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem>Name, Ascending</DropdownMenuItem>
          <DropdownMenuItem>Name, Decending</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Created, Latest First</DropdownMenuItem>
          <DropdownMenuItem>Created, Oldest First</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          <DropdownMenuItem>Question, Most First</DropdownMenuItem>
          <DropdownMenuItem>Question, Least First</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
