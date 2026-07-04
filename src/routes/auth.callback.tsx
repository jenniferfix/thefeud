import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';
import {
  AUTH_FLOWS,
  getAuthCallbackDestination,
  getAuthCallbackError,
  getSafeRedirectPath,
} from '@/lib/auth';
import { exchangeOAuthCode } from '@/server/auth';

const optionalString = z.string().optional();

const authCallbackSchema = z.object({
  flow: z.enum(AUTH_FLOWS),
  code: optionalString,
  next: optionalString,
  error: optionalString,
  errorCode: optionalString,
  errorDescription: optionalString,
});

export const Route = createFileRoute('/auth/callback')({
  loader: async ({ deps }) => {},
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const { data, success, error } = authCallbackSchema.safeParse(
          Object.fromEntries(url.searchParams),
        );
        if (!success) throw Error('Invalid params');
        const deps = data;

        const next = getSafeRedirectPath(deps.next);

        switch (deps.flow) {
          case 'recovery':
          case 'oauth':
          case 'signup':
        }

        if (!deps.code || deps.error || deps.errorCode) {
          throw redirect({
            to: '/login',
            search: { redirect: next, error: getAuthCallbackError(deps.flow) },
            statusCode: 303,
          });
        }

        const result = await exchangeOAuthCode({ data: { code: deps.code } });

        if (!result.success) {
          throw redirect({
            to: '/',
            search: { redirect: next, error: getAuthCallbackError(deps.flow) },
            statusCode: 303,
          });
        }
        const destination = getAuthCallbackDestination(deps.flow, next);
        throw redirect({
          href: destination,
          statusCode: 303,
        });
      },
    },
  },
});
