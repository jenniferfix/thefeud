import { ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type SortOrder = 'asc' | 'desc';

export type SortColumn = 'created_at' | 'question' | 'answers';

export type SortOpts = {
  title: string;
  column: SortColumn;
  order?: SortOrder;
};

export type SortSelections = Record<string, SortOpts>;

const sortOpts = {
  newest: {
    title: 'Newest',
    column: 'created_at',
    order: 'desc',
  },
  oldest: {
    title: 'Oldest',
    column: 'created_at',
    order: 'desc',
  },
  questionAsc: {
    title: 'Question, Asc',
    column: 'question',
    order: 'asc',
  },
  questionDesc: {
    title: 'Question, Desc',
    column: 'question',
    order: 'desc',
  },
  numAnswersAsc: {
    title: 'Number of Answers, Asc',
    column: 'answers',
    order: 'asc',
  },
  numAnswersDesc: {
    title: 'Number of Answers, Desc',
    column: 'answers',
    order: 'desc',
  },
} as SortSelections;

export type SortControlProps = {
  onSortChange?: (opts: SortOpts) => void;
  sort?: SortOpts;
};

export const SortControl = ({
  onSortChange,
  sort = sortOpts.newest,
}: SortControlProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>{sort.title}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuCheckboxItem
            checked={sort === sortOpts.newest}
            onClick={() => {
              onSortChange?.(sortOpts.newest);
            }}
          >
            {sortOpts.newest.title}
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={sort === sortOpts.oldest}
            onClick={() => {
              onSortChange?.(sortOpts.oldest);
            }}
          >
            {sortOpts.oldest.title}
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuCheckboxItem
            checked={sort === sortOpts.questionAsc}
            onClick={() => {
              onSortChange?.(sortOpts.questionAsc);
            }}
          >
            {sortOpts.questionAsc.title}
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={sort === sortOpts.questionDesc}
            onClick={() => {
              onSortChange?.(sortOpts.questionDesc);
            }}
          >
            {sortOpts.questionDesc.title}
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuCheckboxItem
            checked={sort === sortOpts.numAnswersDesc}
            onClick={() => {
              onSortChange?.(sortOpts.numAnswersDesc);
            }}
          >
            {sortOpts.numAnswersDesc.title}
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={sort === sortOpts.numAnswersAsc}
            onClick={() => {
              onSortChange?.(sortOpts.numAnswersAsc);
            }}
          >
            {sortOpts.numAnswersAsc.title}
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
