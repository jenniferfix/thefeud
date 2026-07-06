import { Link } from '@tanstack/react-router';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/utils/utils';
export type ErrorCardProps = React.ComponentProps<typeof Card> & {
  title?: string;
  message?: string;
};

export const ErrorCard = ({
  title = 'Error',
  message,
  className,
  ...props
}: ErrorCardProps) => {
  return (
    <Card className={cn('min-w-sm', className)} {...props}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{message}</CardContent>
      <CardFooter>
        <Link
          to="/"
          className={buttonVariants({ variant: 'link', className: 'w-full' })}
        >
          Go home
        </Link>
      </CardFooter>
    </Card>
  );
};
