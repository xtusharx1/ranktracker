import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ThemeSettings from './ThemeSettings';

const Layout = ({ role }) => {
  return (
    <div className="flex">
      <Sidebar role={role} />
      <main className="flex-1 p-6">
        <Outlet />
        {themeSettings && <ThemeSettings />}
      </main>
    </div>
  );
};

export default Layout;
