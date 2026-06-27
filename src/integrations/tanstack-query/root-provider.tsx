import { QueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '#/utils/supabase/isomorphic';

export function getContext() {
  return {
    queryClient: new QueryClient(),
    supabase: getSupabaseClient(),
  };
}
export default function TanstackQueryProvider() {}
