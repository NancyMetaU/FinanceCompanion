import React, { useState } from "react";
import AuthModal from "../auth-page-components/AuthModal";

const SignInButton = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSignInClick = () => {
    setShowAuthModal(true);
  };

  return (
    <>
      <button
        onClick={handleSignInClick}
        className="text-sm font-medium text-royal border border-royal px-4 py-1.5 rounded-md hover:bg-royal hover:text-white transition mr-4 cursor-pointer"
      >
        Sign In
      </button>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default SignInButton;
