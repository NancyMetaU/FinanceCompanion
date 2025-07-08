import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut, getAuth } from "firebase/auth";

const SignOutButton = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(getAuth());
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="text-sm font-medium text-royal border border-royal px-4 py-1.5 rounded-md hover:bg-royal hover:text-white transition mr-4 cursor-pointer"
    >
      Sign Out
    </button>
  );
};

export default SignOutButton;
