import { Link, type LinkProps } from '@tanstack/react-router';
import React from 'react';

const NavLink = (props: LinkProps) => {
  return (
    <Link
      {...props}
      className="flex items-center hover:underline border-e p-3 hover:bg-accent/75"
      activeProps={{ className: 'bg-accent' }}
    >
      {props.children}
    </Link>
  );
};

export default NavLink;
