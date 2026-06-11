import { type ComponentProps, memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useSupabaseAuth } from '@/supabaseauth';

export const SignOutButton = memo(
  ({ ...props }: ComponentProps<typeof Button>) => {
    const auth = useSupabaseAuth();

    const handleSignOut = useCallback(async () => {
      await auth.logout();
    }, [auth]);

    return <Button {...props} onClick={handleSignOut} />;
  },
);
