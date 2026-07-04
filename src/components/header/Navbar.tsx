import { Link, linkOptions, useLocation } from '@tanstack/react-router';
import { LogOut, MenuIcon, Settings, UserRound } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useSupabaseAuth } from '@/supabaseauth';
import { cn } from '@/utils/utils';

const links = [
  linkOptions({
    label: 'Home',
    to: '/',
  }),
  linkOptions({
    label: 'Games',
    to: '/games',
  }),
  linkOptions({
    label: 'Questions',
    to: '/questions',
  }),
];

const LoginButton = ({
  closeCallback,
  mobile = false,
  className = '',
}: {
  closeCallback?: () => void | Promise<void>;
  mobile?: boolean;
  className?: string;
}) => {
  const auth = useSupabaseAuth();
  const { pathname } = useLocation();

  const handleLogoutClick = async () => {
    try {
      await auth.logout();
      await closeCallback?.();
    } catch {
      toast.error('Sign out error, please try again.');
    }
  };

  if (auth.isAuthenticated) {
    if (mobile) {
      return (
        <div className="grow flex flex-col py-2 justify-end">
          <p className="truncate px-2 text-sm text-muted-foreground">
            {auth.user?.email ?? 'Signed in'}
          </p>
          <Link
            to="/settings"
            search={{ r: pathname }}
            className={buttonVariants({
              variant: 'link',
              className: 'justify-start text-primary-foreground w-full',
            })}
            onClick={() => {
              closeCallback?.();
            }}
          >
            <span className="flex justify-start border-b py-2 hover:bg-accent/75 text-base w-full items-center">
              <Settings className="mr-3" />
              Settings
            </span>
          </Link>
          <Button
            type="button"
            variant="link"
            className="justify-start text-base text-primary-foreground mt-2"
            disabled={auth.isLoggingOut}
            onClick={handleLogoutClick}
          >
            <span className="flex justify-start py-2 hover:bg-accent/75 text-base w-full items-center">
              <LogOut className="mr-2" />
              {auth.isLoggingOut ? 'Signing out…' : 'Sign out'}
            </span>
          </Button>
        </div>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn('border-x text-base', className)}
          >
            <UserRound /> Account
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-56">
          <DropdownMenuLabel className="truncate">
            {auth.user?.email ?? 'Signed in'}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link to="/settings" search={{ r: pathname }} className="flex">
              <Settings className="mr-3" /> Account Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={auth.isLoggingOut}
            onSelect={handleLogoutClick}
          >
            <LogOut /> {auth.isLoggingOut ? 'Signing out…' : 'Sign out'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  } else {
    return (
      <Link
        to="/login"
        search={{ redirect: pathname }}
        className={buttonVariants({
          variant: 'link',
          className: 'text-base justify-start text-left text-white',
        })}
        onClick={() => closeCallback?.()}
      >
        Sign in
      </Link>
    );
  }
};

export const Navbar = () => {
  const auth = useSupabaseAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const visibleLinks = auth.isAuthenticated
    ? links
    : links.filter((link) => link.to === '/');

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <header className="w-full flex justify-between border-b border-b-foreground/10 items-center">
      <Sheet open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="md:hidden ml-2"
            aria-label="Open menu"
          >
            <MenuIcon />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle hidden>Menu</SheetTitle>
            <SheetDescription hidden>Application Menu</SheetDescription>
          </SheetHeader>
          <nav className="h-full">
            <ul className="h-full flex flex-col justify-start">
              {visibleLinks.map((link) => (
                <Link
                  key={`moblink${link.to}`}
                  to={link.to}
                  className="flex justify-start border-b py-2 pl-2 hover:bg-accent/75 text-base"
                  // activeProps={{ className: 'bg-active' }}
                  onClick={closeSidebar}
                >
                  {link.label}
                </Link>
              ))}
              <LoginButton closeCallback={closeSidebar} mobile />
            </ul>
          </nav>
        </SheetContent>
      </Sheet>

      <div className="hidden md:flex">
        {visibleLinks.map(({ to, label, ...props }) => (
          <Link
            key={to}
            to={to}
            className={buttonVariants({
              variant: 'link',
              size: 'lg',
              className: 'rounded-none text-white',
            })}
            // activeProps={{ className: 'bg-feudblue/40' }}
            {...props}
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="flex">
        <LoginButton className="hidden md:flex" />
      </div>
    </header>
  );
};
