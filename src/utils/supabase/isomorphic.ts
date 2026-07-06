import { createIsomorphicFn } from '@tanstack/react-start';
import { getSupabaseBrowserClient } from './client';
import { createSupabaseServerClient } from './server';

export const getSupabaseClient = createIsomorphicFn()
  .client(() => getSupabaseBrowserClient())
  .server(() => createSupabaseServerClient());
