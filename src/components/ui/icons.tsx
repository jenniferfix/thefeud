import { AlertTriangle, CircleCheck, CircleX, LucideProps } from 'lucide-react';
import { cn } from '#/lib/utils';

export const Warning = ({ className, ...props }: LucideProps) => {
  return (
    <AlertTriangle className={cn('text-yellow-500', className)} {...props} />
  );
};

export const Error = ({ className, ...props }: LucideProps) => {
  return <CircleX className={cn('text-red-500', className)} {...props} />;
};

export const Good = ({ className, ...props }: LucideProps) => {
  return <CircleCheck className={cn('text-green-500', className)} {...props} />;
};
