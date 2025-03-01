import React from 'react';
import { Link } from 'react-router-dom';

import { LogOut } from 'lucide-react';
const Navbar = ({ onLogout }) => {
  return (
    <div className="navbar-container flex justify-between items-center p-4 bg-white shadow-md">
      <div className="logo">
        {/* Logo or Navbar Title */}
        <h1 className="text-xl font-semibold"> </h1>
      </div>
      <div className="user-actions flex items-center space-x-4">
        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all"
        >
          <LogOut className="w-5 h-5 mr-2" /> Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
