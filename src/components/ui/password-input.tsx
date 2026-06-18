import { Eye, EyeOff } from 'lucide-react';
import React from 'react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { cn } from '@/utils/utils';

export const PasswordInput = ({
  className,
  disabled,
  ...props
}: React.ComponentProps<'input'>) => {
  const [showPassword, setShowPassword] = React.useState(false);
  return (
    <InputGroup>
      <InputGroupInput
        disabled={disabled}
        type={showPassword ? 'text' : 'password'}
        className={cn('', className)}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          disabled={disabled}
          variant="ghost"
          size="icon-sm"
          onClick={() => setShowPassword((show) => !show)}
        >
          {showPassword ? <EyeOff /> : <Eye />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
};
