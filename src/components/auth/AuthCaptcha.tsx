import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import React from 'react';

const siteKey: string | undefined = import.meta.env.VITE_TURNSTILE_SITE_KEY;

export const isCaptchaEnabled = () => Boolean(siteKey);

export type AuthCaptchaHandle = {
  /** Turnstile tokens are single-use; reset after every Auth request. */
  reset: () => void;
};

/**
 * Shared Cloudflare Turnstile widget for Supabase Auth flows. Calls
 * `onToken` with a fresh token on success and with `null` on expiry or
 * error. Renders nothing when no site key is configured, so Auth calls
 * fall back to tokenless requests (CAPTCHA disabled in Supabase).
 */
export const AuthCaptcha = React.forwardRef<
  AuthCaptchaHandle,
  {
    onToken: (token: string | null) => void;
    className?: string;
  }
>(({ onToken, className }, ref) => {
  const turnstileRef = React.useRef<TurnstileInstance | null>(null);
  const onTokenRef = React.useRef(onToken);

  React.useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  React.useImperativeHandle(
    ref,
    () => ({
      reset: () => {
        onTokenRef.current(null);
        turnstileRef.current?.reset();
      },
    }),
    [],
  );

  if (!siteKey) return null;

  return (
    <Turnstile
      ref={turnstileRef}
      className={className}
      siteKey={siteKey}
      onSuccess={(token) => onTokenRef.current(token)}
      onExpire={() => {
        onTokenRef.current(null);
        turnstileRef.current?.reset();
      }}
      onError={() => onTokenRef.current(null)}
    />
  );
});
