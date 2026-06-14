import { Link, type LinkProps } from '@tanstack/react-router';
import React from 'react';
import { buttonVariants } from './ui/button';

const NavLink = (props: LinkProps) => {
  return (
    <Link
      className={buttonVariants({
        variant: 'link',
        className: 'rounded-none',
      })}
      activeProps={{ className: 'bg-feudblue/40' }}
      {...props}
    >
      {props.children}
    </Link>
  );
};

export default NavLink;
