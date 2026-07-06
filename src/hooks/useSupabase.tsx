import { useRouteContext } from '@tanstack/react-router';

export function useSupabase() {
  return useRouteContext({
    from: '__root__',
    select: (context) => context.supabase,
  });
}
