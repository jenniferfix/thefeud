import { useNavigate, useRouter } from "@tanstack/react-router";
import { GoogleGradiantIcon } from "@/components/icons/GoogleGradiantIcon";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/utils";

export const SignInWithGoogle = ({
  className,
  ...props
}: React.ComponentProps<typeof Button>) => {
  const navigate = useNavigate();
  const router = useRouter();
  return (
    <Button
      className={cn("w-full", className)}
      onClick={async () => {
        //await authClient.signIn.social({ provider: "google" });
        await router.invalidate();
        navigate({ to: "/" });
      }}
      {...props}
    >
      <GoogleGradiantIcon />
      <span>Sign in with Google</span>
    </Button>
  );
};
