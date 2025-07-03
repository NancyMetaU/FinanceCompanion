import React from "react";
import logo from "/src/assets/finance-companion-logo.png";

const Header = () => {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-slate-100 shadow-md">
      <div className="flex items-center space-x-4">
        <img src={logo} alt="Logo" className="h-15 w-15" />
        <h1 className="text-2xl font-bold text-slate-800">Finance Companion</h1>
      </div>

      <button
        className="text-sm font-medium text-[#00009A] border border-[#00009A] px-4 py-1.5
      rounded-md hover:bg-[#00009A] hover:text-white transition mr-4"
      >
        Sign Out
      </button>
    </header>
  );
};

export default Header;
