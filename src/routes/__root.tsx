import { TooltipProvider } from '@radix-ui/react-tooltip';
import { TanStackDevtools } from '@tanstack/react-devtools';
import type { QueryClient } from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { Toaster } from '#/components/ui/sonner';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { getServerAuth, type ServerAuth } from '@/server/auth';
import PostHogProvider from '../integrations/posthog/provider';
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools';

import appCss from '../styles.css?url';
import { SupabaseAuthProvider } from '../supabaseauth';

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async (): Promise<{ auth: ServerAuth }> => {
    const auth = await getServerAuth();
    return { auth };
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Feud',
      },
    ],
    links: [
      {
        rel: 'preload',
        href: '/fonts/clarendonbold.woff2',
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const { auth } = Route.useRouteContext();

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <PostHogProvider>
          <ThemeProvider defaultTheme="dark" storageKey="FeudTheme">
            <SupabaseAuthProvider initialUser={auth.user}>
              <TooltipProvider>{children}</TooltipProvider>
              <TanStackDevtools
                config={{
                  position: 'bottom-right',
                }}
                plugins={[
                  {
                    name: 'Tanstack Router',
                    render: <TanStackRouterDevtoolsPanel />,
                  },
                  TanStackQueryDevtools,
                ]}
              />
            </SupabaseAuthProvider>
            <Toaster />
          </ThemeProvider>
        </PostHogProvider>
        <Scripts />
      </body>
    </html>
  );
}
