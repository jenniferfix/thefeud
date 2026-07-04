import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowBigLeft } from 'lucide-react';
import { z } from 'zod';
import { ChangePasswordForm } from '#/components/auth/ChangePasswordForm';
import { DeleteUserButton } from '#/components/auth/DeleteUserButton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card';
import { useMediaQuery } from '#/hooks/useMediaQuery';

export const Route = createFileRoute('/_auth/_navbar-layout/settings')({
  validateSearch: z.object({ r: z.string().optional() }),
  component: RouteComponent,
});

const Settings = () => {
  return (
    <div>
      <div>
        <div className="text-base font-semibold my-2">Change Password</div>
        <div className="pl-2">
          <ChangePasswordForm />
        </div>
      </div>
      <div className="mt-6 border-t pt-6">
        <h2 className="text-base font-semibold text-destructive">
          Danger zone
        </h2>
        <p className="mt-1 mb-3 text-sm text-muted-foreground">
          Deleting your account permanently removes all of your data.
        </p>
        <DeleteUserButton />
      </div>
    </div>
  );
};

const CardWrapped = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full flex justify-center items-center">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription hidden>Change user settings</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
};

const GoBack = ({ to }: { to: string }) => {
  return (
    <Link to={to} className="flex text-sm items-center mx-2 my-2">
      <ArrowBigLeft className="size-4 mr-2" />
      Go back
    </Link>
  );
};

function RouteComponent() {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const { r } = Route.useSearch();

  if (isMobile)
    return (
      <>
        {r && <GoBack to={r} />}
        <div className="mx-4 my-4">
          <Settings />
        </div>
      </>
    );
  else
    return (
      <>
        {r && <GoBack to={r} />}
        <div className="h-full flex justify-center items-center">
          <CardWrapped>
            <Settings />
          </CardWrapped>
        </div>
      </>
    );
}
