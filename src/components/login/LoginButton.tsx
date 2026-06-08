import { Link, useNavigate } from '@tanstack/react-router';
import React from 'react';
import { Button } from '@/components/ui/button';
import { useSupabaseAuth } from '@/supabaseauth';
import { SignedIn } from '../auth/signed-in';
import { SignedOut } from '../auth/signed-out';

const Login = ({ onClick }: { onClick: Function }) => {
  const auth = useSupabaseAuth();
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    auth.logout().then(() => navigate({ to: '/' }));
  };

  return (
    <>
      <SignedIn>
        <div className="flex items-center">
          {/* {user && <div>Welcome {user.email}</div>} */}
          <Button
            variant="link"
            onClick={handleLogoutClick}
            className="text-lg pl-0"
          >
            Logout
          </Button>
        </div>
      </SignedIn>
      <SignedOut>
        <Button
          variant="link"
          className="text-lg pl-0"
          onClick={() => onClick(false)}
          asChild
        >
          <Link to="/login" search={{ redirect: '/' }} className="text-lg pl-0">
            Login
          </Link>
        </Button>
      </SignedOut>
    </>
  );
};

export default Login;
