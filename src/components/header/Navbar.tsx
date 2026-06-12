import {
  Link,
  type LinkProps,
  linkOptions,
  useLocation,
  useNavigate,
} from '@tanstack/react-router';
import { MenuIcon } from 'lucide-react';
import React from 'react';
import ThemeToggle from '@/components/header/ThemeToggle';
import NavLink from '@/components/NavLink';
import { Button } from '@/components/ui/button';
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
  linkOptions({
    label: 'Game Editor',
    to: '/e/games',
  }),
  linkOptions({
    label: 'Play',
    to: '/c',
  }),
];

const LoginButton = ({
  closeCallback,
  mobile = false,
  className = '',
}: {
  closeCallback?: Function;
  mobile?: boolean;
  className?: string;
}) => {
  const auth = useSupabaseAuth();
  const { pathname } = useLocation();

  const handleLogoutClick = () => {
    auth.logout();
    // supabase.auth.signOut().then(() => {
    //   closeCallback();
    //   navigate({ to: '/' });
    // });
  };

  if (auth.isAuthenticated) {
    return (
      <div
        className={cn(
          'flex items-center hover:bg-accent/75 px-4',
          mobile ? 'border-b pl-2' : 'border-x',
          className,
        )}
        onClick={() => {
          handleLogoutClick();
          closeCallback && closeCallback();
        }}
      >
        Logout
      </div>
    );
  } else {
    return (
      <Link
        to="/login"
        search={{ redirect: pathname }}
        className="flex items-center hover:underline hover:bg-accent/50 border-x px-4"
        onClick={() => closeCallback && closeCallback()}
      >
        Login
      </Link>
    );
  }
};

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <header className="w-full flex justify-between border-b border-b-foreground/10 items-center">
      <Sheet open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <SheetTrigger asChild>
          <Button size="icon" variant="ghost" className="md:hidden ml-2">
            <MenuIcon />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle hidden>Menu</SheetTitle>
            <SheetDescription hidden>Application Menu</SheetDescription>
            <nav>
              <ul className="flex flex-col justify-start">
                {links.map((link) => (
                  <Link
                    key={'moblink' + link.to}
                    to={link.to}
                    className="flex justify-start border-b py-2 pl-2 hover:bg-accent/75"
                    activeProps={{ className: 'bg-active' }}
                    onClick={closeSidebar}
                  >
                    {link.label}
                  </Link>
                ))}
                <LoginButton closeCallback={closeSidebar} mobile />
              </ul>
            </nav>
          </SheetHeader>
        </SheetContent>
      </Sheet>
      <div className="hidden md:flex">
        {links.map((link) => (
          <NavLink key={'link' + link.to} {...link}>
            {link.label}
          </NavLink>
        ))}
      </div>
      <div className="flex">
        <LoginButton className="hidden md:flex" />
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Navbar;
