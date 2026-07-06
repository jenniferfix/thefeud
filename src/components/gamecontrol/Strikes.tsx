import StrikeSvg from '@/components/StrikeSvg';
import { cn } from '@/utils/utils';

const Strikes = ({
  strikes,
  className,
}: {
  strikes: number;
  className: string;
}) => {
  return (
    <div className={cn('flex gap-2', className)}>
      <StrikeSvg
        className={cn('h-8', strikes >= 1 ? 'opacity-100' : 'opacity-15')}
      />
      <StrikeSvg
        className={cn('h-8', strikes >= 2 ? 'opacity-100' : 'opacity-15')}
      />
      <StrikeSvg
        className={cn('h-8', strikes >= 3 ? 'opacity-100' : 'opacity-15')}
      />
    </div>
  );
};

export default Strikes;
