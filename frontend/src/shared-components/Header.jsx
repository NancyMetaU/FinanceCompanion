import React from "react";
import { Link } from "react-router-dom";
import SignOutButton from "./SignOutButton";
import logo from "/src/assets/finance-companion-logo.png";

const Header = () => {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-slate-100 shadow-md">
      <div className="flex items-center space-x-4 ml-6 gap-6">
        <Link
          to="/"
          className="flex items-center space-x-4 hover:opacity-80 transition-opacity"
        >
          <img src={logo} alt="Logo" className="h-20 w-20" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-royal via-blue-600 to-purple-600 bg-clip-text text-transparent tracking-wide">
            Finance Companion
          </h1>
        </Link>
      </div>
      <SignOutButton />
    </header>
  );
};

export default Header;
