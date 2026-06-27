import React from 'react';
import { toast } from 'sonner';
import { GoogleGradiantIcon } from '@/components/icons/GoogleGradiantIcon';
import { Button } from '@/components/ui/button';
import { useSupabase } from '@/hooks/useSupabase';
import { getSafeRedirectPath } from '@/lib/auth';
import { cn } from '@/utils/utils';

export const SignInWithGoogle = ({
  className,
  redirect,
  ...props
}: React.ComponentProps<typeof Button> & { redirect?: string }) => {
  const supabase = useSupabase();
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <Button
      {...props}
      type="button"
      className={cn('w-full', className)}
      disabled={props.disabled || isLoading}
      onClick={async () => {
        setIsLoading(true);
        const callbackUrl = new URL('/auth/callback', window.location.origin);
        callbackUrl.searchParams.set('next', getSafeRedirectPath(redirect));

        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: callbackUrl.toString(),
          },
        });

        if (error) {
          setIsLoading(false);
          toast.error('Google sign in could not be started.');
        }
      }}
    >
      <GoogleGradiantIcon />
      <span>Sign in with Google</span>
    </Button>
  );
};
