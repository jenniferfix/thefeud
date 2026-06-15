import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/_navbar-layout/_auth/c')({
  component: () => <ControlLayout />,
});

const ControlLayout = () => {
  return (
    <React.Fragment>
      <div className="flex border-b">
        <Link to="/c/new">Start New Game</Link>
        <Link to="/c/continue">Continue Game</Link>
      </div>
      <Outlet />
    </React.Fragment>
  );
};
