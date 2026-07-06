import { describe, expect, it } from 'vitest';
import {
  buildAuthCallbackUrl,
  getAuthCallbackDestination,
  getAuthCallbackError,
  getSafeRedirectPath,
  hasEmailIdentity,
  parseAuthFlow,
  parseAuthRouteError,
} from './auth';

describe('auth helpers', () => {
  it('accepts local redirects and rejects external redirects', () => {
    expect(getSafeRedirectPath('/games?sort=recent')).toBe(
      '/games?sort=recent',
    );
    expect(getSafeRedirectPath('https://attacker.example')).toBe('/');
    expect(getSafeRedirectPath('//attacker.example')).toBe('/');
    expect(getSafeRedirectPath(undefined, '/login')).toBe('/login');
  });

  it('builds callback URLs with explicit flow and a safe destination', () => {
    const callback = new URL(
      buildAuthCallbackUrl({
        origin: 'https://feud.example',
        flow: 'signup',
        next: 'https://attacker.example',
      }),
    );

    expect(callback.origin).toBe('https://feud.example');
    expect(callback.pathname).toBe('/auth/callback');
    expect(callback.searchParams.get('flow')).toBe('signup');
    expect(callback.searchParams.get('next')).toBe('/');
  });

  it('normalizes callback flows and errors', () => {
    expect(parseAuthFlow('recovery')).toBe('recovery');
    expect(parseAuthFlow('unknown')).toBe('oauth');
    expect(getAuthCallbackError('oauth')).toBe('oauth_callback');
    expect(getAuthCallbackError('signup')).toBe('email_confirmation');
    expect(getAuthCallbackError('recovery')).toBe('password_recovery');
    expect(getAuthCallbackDestination('oauth', '/games')).toBe('/games');
    expect(getAuthCallbackDestination('signup', '//attacker.example')).toBe(
      '/',
    );
    expect(getAuthCallbackDestination('recovery', '/games')).toBe(
      '/reset-password',
    );
    expect(parseAuthRouteError('password_recovery')).toBe('password_recovery');
    expect(parseAuthRouteError('unknown')).toBeUndefined();
  });

  it('detects email, linked, and Google-only identities', () => {
    expect(hasEmailIdentity({ providers: ['email'] })).toBe(true);
    expect(hasEmailIdentity({ providers: ['google', 'email'] })).toBe(true);
    expect(hasEmailIdentity({ providers: ['google'] })).toBe(false);
    expect(
      hasEmailIdentity({ app_metadata: { providers: ['google', 'email'] } }),
    ).toBe(true);
    expect(hasEmailIdentity(null)).toBe(false);
  });
});
