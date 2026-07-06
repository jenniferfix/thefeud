import type { AuthError, User } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import React from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import type { AuthenticatedUser } from '@/server/auth';

export interface AuthContext {
  isAuthenticated: boolean;
  user: User | AuthenticatedUser | null;
  login: ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  error: AuthError | null;
}

const AuthContext = React.createContext<AuthContext | null>(null);

export const SupabaseAuthProvider = ({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: AuthenticatedUser | null;
}) => {
  const supabase = useSupabase();
  const router = useRouter();
  const [user, setUser] = React.useState<User | AuthenticatedUser | null>(
    initialUser,
  );
  const [isLoggingIn, setIsLoggingIn] = React.useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState<boolean>(false);
  const [error, setError] = React.useState<AuthError | null>(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const login = React.useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      setIsLoggingIn(true);
      setError(null);
      try {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          setError(authError);
          throw authError;
        }

        await router.invalidate();
      } finally {
        setIsLoggingIn(false);
      }
    },
    [router, supabase],
  );

  const logout = React.useCallback(async () => {
    setIsLoggingOut(true);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signOut();

      if (authError) {
        setError(authError);
        throw authError;
      }

      queryClient.clear();
      await router.invalidate();
    } finally {
      setIsLoggingOut(false);
    }
  }, [queryClient, router, supabase]);

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        isLoggingIn,
        isLoggingOut,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error(
      'useSupabaseAuth must be used within a SupabaseAuthProvider!',
    );
  }
  return context;
};
export const useAuthenticatedUser = () => {
  const { user, ...other } = useSupabaseAuth();
  if (!user?.id) throw Error('User must be authenticated');
  return { user, ...other };
};
