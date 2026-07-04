import { createFileRoute, redirect } from '@tanstack/react-router';
import { ResetPasswordCard } from '@/components/auth/ResetPasswordCard';

export const Route = createFileRoute('/reset-password')({
  headers: () => ({
    'Cache-Control':
      'no-store, no-cache, must-revalidate,proxy-revalidate,max-age=0',
  }),
  beforeLoad: ({ context: { auth } }) => {
    if (!auth.user) {
      throw redirect({
        to: '/login',
        search: { redirect: '/', error: 'password_recovery' },
      });
    }
  },
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  return (
    <main className="min-h-full flex items-center justify-center px-4 py-8">
      <ResetPasswordCard />
    </main>
  );
}
