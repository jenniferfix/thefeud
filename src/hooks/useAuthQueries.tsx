import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import { deleteUser } from '#/server/auth';
import { useSupabaseAuth } from '@/supabaseauth';

export const useDeleteUser = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const auth = useSupabaseAuth();

  return useMutation({
    mutationFn: async () => {
      const result = await deleteUser();
      if (result?.success !== true) throw new Error('Account deletion failed');
      return result;
    },
    onError: () => {
      toast.error('Unable to delete account. Please try again.');
    },
    onSuccess: async () => {
      let loggedOut = false;

      try {
        await auth.logout();
        loggedOut = true;
      } catch (error) {
        console.error('Failed to finalize deleted account logout', error);
      }

      if (!loggedOut) {
        queryClient.clear();
        try {
          await router.invalidate();
        } catch (error) {
          console.error(
            'Failed to invalidate deleted account auth state',
            error,
          );
        }
      }

      toast.success('Account deleted');

      try {
        await router.navigate({ to: '/', replace: true });
      } catch (error) {
        console.error('Failed to navigate after account deletion', error);
        try {
          window.location.replace('/');
        } catch (fallbackError) {
          console.error(
            'Failed to reload after account deletion',
            fallbackError,
          );
        }
      }
    },
  });
};
