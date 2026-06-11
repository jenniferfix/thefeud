import type {
  AuthError,
  AuthResponse,
  Session,
  User,
} from '@supabase/supabase-js';
import React from 'react';
import useSupabase from '@/hooks/useSupabase';

export interface AuthContext {
  isAuthenticated: boolean;
  checkAuthenticated: () => Promise<boolean>;
  session: Session | null;
  user: User | null;
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
  isLoginError: boolean;
  isLogoutError: boolean;
  error: Error | null;
}

const AuthContext = React.createContext<AuthContext | null>(null);

export const SupabaseAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const supabase = useSupabase();
  const [session, setSession] = React.useState<Session | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = React.useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState<boolean>(false);
  const [isLoginError, setIsLoginError] = React.useState<boolean>(false);
  const [isLogoutError, setIsLogoutError] = React.useState<boolean>(false);
  const [error, setError] = React.useState<AuthError | null>(null);

  React.useEffect(() => {
    const initializeAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsAuthenticated(Boolean(data.session));
        setSession(data.session);
        setUser(data.session.user);
      }
    };
    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const { data } = await supabase.auth.getUser();
      setIsAuthenticated(Boolean(session));
      setSession(session);
      setUser(data.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = React.useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      setIsLoggingIn(true);
      setIsLoginError(false);
      setError(null);
      supabase.auth
        .signInWithPassword({ email: email, password: password })
        .then(({ data, error }) => {
          if (!error) {
            setSession(data.session);
            setUser(data.user);
            setIsLoggingIn(false);
          } else {
            setError(error);
            setIsLoginError(true);
            setIsLoggingIn(false);
          }
        });
    },
    [],
  );

  const logout = React.useCallback(async () => {
    setIsLoggingOut(true);
    setIsLogoutError(false);
    setError(null);
    const { error } = await supabase.auth.signOut();

    if (!error) {
      setSession(null);
      setIsLoggingOut(false);
    } else {
      setError(error);
      setIsLogoutError(true);
      setIsLoggingOut(false);
    }
  }, []);

  const checkAuthenticated = React.useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated) {
      const { data, error } = await supabase.auth.refreshSession();
      if (!data.user) return false;
      setSession(data.session);
      setUser(data.user);
      setIsAuthenticated(true);
    }
    return true;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        checkAuthenticated,
        isAuthenticated,
        session,
        user,
        login,
        logout,
        isLoggingIn,
        isLoggingOut,
        isLoginError,
        isLogoutError,
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
