import React, { useState } from "react";
import { Link } from "react-router-dom";
import SignOutButton from "./SignOutButton";
import { useAuth } from "../context/AuthContext";
import AuthModal from "../auth-page-components/AuthModal";
import logo from "/src/assets/finance-companion-logo.png";

const Header = () => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSignInClick = () => {
    setShowAuthModal(true);
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-slate-100 shadow-md">
      <div className="flex items-center space-x-4 ml-6 gap-6">
        <Link
          to="/"
          className="flex items-center space-x-4 hover:opacity-80 transition-opacity"
        >
          <img src={logo} alt="Logo" className="h-20 w-20" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-royal to-blue-400 bg-clip-text text-transparent tracking-wide">
            Finance Companion
          </h1>
        </Link>
      </div>

      <div className="flex items-center">
        {user ? (
          <SignOutButton />
        ) : (
          <button
            onClick={handleSignInClick}
            className="text-sm font-medium text-royal border border-royal px-4 py-1.5 rounded-md hover:bg-royal hover:text-white transition mr-4"
          >
            Sign In
          </button>
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </header>
  );
};

export default Header;
