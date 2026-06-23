import React from 'react';
import { cn } from '#/lib/utils';
import { Button } from './button';

export type HoldButtonProps = {
  duration?: number;
  holdText?: string;
  showHoldText?: boolean;
  onActivate?: () => void | Promise<void>;
} & React.ComponentProps<typeof Button>;

export const HoldButton = ({
  onActivate,
  duration = 1000,
  holdText = 'Keep held...',
  showHoldText = true,
  children,
  className,
  disabled,
  ...props
}: HoldButtonProps) => {
  const [isHolding, setIsHolding] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const startTimeRef = React.useRef<number | null>(null);
  const frameRef = React.useRef<number | null>(null);
  const activatedRef = React.useRef(false);

  const stopHolding = React.useCallback(() => {
    setIsHolding(false);
    setProgress(0);
    startTimeRef.current = null;
    activatedRef.current = false;
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const tick = React.useCallback(
    (time: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = time;
      }

      const elapsed = time - startTimeRef.current;
      const nextProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(nextProgress);

      if (nextProgress >= 100 && !activatedRef.current) {
        activatedRef.current = true;
        onActivate?.();
        stopHolding();
        return;
      }
      frameRef.current = requestAnimationFrame(tick);
    },
    [duration, onActivate, stopHolding],
  );

  const startHolding = React.useCallback(() => {
    if (disabled || isHolding) return;
    setIsHolding(true);
    setProgress(0);
    activatedRef.current = false;
    frameRef.current = requestAnimationFrame(tick);
  }, [disabled, isHolding, tick]);

  return (
    <Button
      disabled={disabled}
      className={cn(
        className,
        'relative overflow-hidden select-none active:scale-100',
      )}
      onPointerDown={startHolding}
      onPointerUp={stopHolding}
      onPointerLeave={stopHolding}
      onPointerCancel={stopHolding}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          startHolding();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          stopHolding();
        }
      }}
      {...props}
    >
      <span
        className={`absolute inset-y-0 left-0 bg-primary/50 transition-none`}
        style={{ width: `${progress}%` }}
      />
      <span>{isHolding && showHoldText ? holdText : children}</span>
    </Button>
  );
};
