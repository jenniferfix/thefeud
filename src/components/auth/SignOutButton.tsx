import { useRouter } from "@tanstack/react-router";
import { type ComponentProps, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from "@/supabaseauth";

export const SignOutButton = memo(
  ({ ...props }: ComponentProps<typeof Button>) => {
    const router = useRouter();
    const auth = useSupabaseAuth();

    const handleSignOut = useCallback(async () => {
      await auth.logout();
      await router.invalidate();
    }, [router.invalidate]);

    return <Button {...props} onClick={handleSignOut} />;
  },
);
