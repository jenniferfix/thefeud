import React from 'react';
import {
  AuthCaptcha,
  type AuthCaptchaHandle,
  isCaptchaEnabled,
} from '@/components/auth/AuthCaptcha';
import { useSupabase } from '@/hooks/useSupabase';
import { authorizeRealtimeViewer } from '@/server/joincodes';

type GateStatus = 'checking' | 'captcha' | 'authorizing' | 'ready' | 'error';

/**
 * Authorizes a viewer for a private game channel before mounting the game.
 * Viewers without a session are silently signed in as Supabase anonymous
 * users (with a Turnstile token when CAPTCHA is enabled); the server then
 * records a read grant for this game before the realtime subscription opens.
 */
export const RealtimeViewerGate = ({
  code,
  children,
}: {
  code: string;
  children: React.ReactNode;
}) => {
  const supabase = useSupabase();
  const [status, setStatus] = React.useState<GateStatus>('checking');
  const startedRef = React.useRef(false);
  const captchaRef = React.useRef<AuthCaptchaHandle | null>(null);

  const signInAndAuthorize = React.useCallback(
    async (captchaToken?: string) => {
      setStatus('authorizing');
      try {
        const { error } = await supabase.auth.signInAnonymously({
          options: captchaToken ? { captchaToken } : undefined,
        });
        if (error) throw error;
        await authorizeRealtimeViewer({ data: { code } });
        setStatus('ready');
      } catch {
        captchaRef.current?.reset();
        setStatus('error');
      }
    },
    [code, supabase],
  );

  React.useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        try {
          await authorizeRealtimeViewer({ data: { code } });
          setStatus('ready');
        } catch {
          setStatus('error');
        }
        return;
      }

      if (isCaptchaEnabled()) {
        setStatus('captcha');
        return;
      }

      await signInAndAuthorize();
    })();
  }, [code, signInAndAuthorize, supabase]);

  if (status === 'ready') return <>{children}</>;

  if (status === 'error') {
    return (
      <div className="h-screen w-screen flex items-center justify-center p-4">
        <p className="text-center text-lg">
          This link is invalid or has expired. Ask the host for a new one.
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center gap-4 p-4">
      {status === 'captcha' && (
        <AuthCaptcha
          ref={captchaRef}
          onToken={(token) => {
            if (token) void signInAndAuthorize(token);
          }}
        />
      )}
      <p className="text-muted-foreground">Connecting to the game…</p>
    </div>
  );
};
