import { memo } from 'react';
import { useSupabaseAuth } from '@/supabaseauth';

export const SignedIn = memo(({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSupabaseAuth();

  if (!isAuthenticated) return null;
  return <>{children}</>;
});
