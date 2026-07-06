export const AUTH_FLOWS = ['oauth', 'signup', 'recovery'] as const;

export type AuthFlow = (typeof AUTH_FLOWS)[number];

export const AUTH_ROUTE_ERRORS = [
  'oauth_callback',
  'email_confirmation',
  'password_recovery',
] as const;

export type AuthRouteError = (typeof AUTH_ROUTE_ERRORS)[number];

export const getSafeRedirectPath = (
  redirect: string | null | undefined,
  fallback = '/',
) => {
  if (!redirect?.startsWith('/') || redirect.startsWith('//')) {
    return fallback;
  }

  return redirect;
};

export const parseAuthFlow = (value: unknown): AuthFlow => {
  return typeof value === 'string' && AUTH_FLOWS.includes(value as AuthFlow)
    ? (value as AuthFlow)
    : 'oauth';
};

export const parseAuthRouteError = (
  value: unknown,
): AuthRouteError | undefined => {
  return typeof value === 'string' &&
    AUTH_ROUTE_ERRORS.includes(value as AuthRouteError)
    ? (value as AuthRouteError)
    : undefined;
};

export const getAuthCallbackError = (flow: AuthFlow): AuthRouteError => {
  switch (flow) {
    case 'signup':
      return 'email_confirmation';
    case 'recovery':
      return 'password_recovery';
    default:
      return 'oauth_callback';
  }
};

export const getAuthCallbackDestination = (flow: AuthFlow, next?: string) => {
  return flow === 'recovery' ? '/reset-password' : getSafeRedirectPath(next);
};

export const buildAuthCallbackUrl = ({
  origin,
  flow,
  next,
}: {
  origin: string;
  flow: AuthFlow;
  next?: string;
}) => {
  const callbackUrl = new URL('/auth/callback', origin);
  callbackUrl.searchParams.set('flow', flow);
  callbackUrl.searchParams.set('next', getSafeRedirectPath(next));
  return callbackUrl.toString();
};

type ProviderAwareUser = {
  providers?: string[];
  app_metadata?: {
    provider?: unknown;
    providers?: unknown;
  };
};

export const hasEmailIdentity = (
  user: ProviderAwareUser | null | undefined,
) => {
  if (!user) return false;

  if (Array.isArray(user.providers)) {
    return user.providers.includes('email');
  }

  const metadataProviders = user.app_metadata?.providers;
  if (Array.isArray(metadataProviders)) {
    return metadataProviders.includes('email');
  }

  return user.app_metadata?.provider === 'email';
};
