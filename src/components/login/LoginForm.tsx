import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Waiting } from "@/components/ui/waiting";
import { useToast } from "@/hooks/use-toast";
import useSupabase from "@/hooks/useSupabase";
import { useSupabaseAuth } from "@/supabaseauth";
import { cn } from "@/utils/utils";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

type FormValues = z.infer<typeof formSchema>;

export const LoginForm = ({ redirect }: { redirect?: string }) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const navigate = useNavigate();
  const auth = useSupabaseAuth();
  const supabase = useSupabase();
  const { toast } = useToast();

  React.useEffect(() => {
    if (auth.isLoginError) {
      toast({ title: "Login Error", description: auth.error?.message });
    }
  }, [auth.isLoginError, auth.error]);

  React.useEffect(() => {
    if (auth.isAuthenticated) navigate({ to: "/" });
  }, [auth.isAuthenticated]);

  const loginForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const createAccountForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onLoginSubmit = (data: FormValues) => {
    const { email, password } = data;
    auth.login({ email, password }).then(() => {
      if (redirect) {
        navigate({ to: redirect });
      }
    });
  };

  const onCreateAccountSubmit = async (formData: FormValues) => {
    const { email, password } = formData;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: import.meta.env.VITE_HOST!,
      },
    });
    if (data.user?.confirmation_sent_at) {
      toast({
        title: "Confirmation sent",
        description: `Confirmation email sent to: ${data.user?.email}`,
      });
    }
    // console.log(data, error);
  };

  return (
    <Form {...loginForm}>
      <form
        onSubmit={loginForm.handleSubmit(onLoginSubmit)}
        className="space-y-4 z-60 max-w-screen-sm m-auto"
      >
        <FormField
          control={loginForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={loginForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex space-x-2">
          <Button type="submit" className="flex-1" disabled={auth.isLoggingIn}>
            {auth.isLoggingIn ? <Waiting /> : "Login"}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                Create Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Account</DialogTitle>
                <DialogDescription hidden>
                  Form to create a new account
                </DialogDescription>
              </DialogHeader>
              <Form {...createAccountForm}>
                <form
                  onSubmit={createAccountForm.handleSubmit(
                    onCreateAccountSubmit,
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={createAccountForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createAccountForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Create Account
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </form>
    </Form>
  );
};

export default LoginForm;
