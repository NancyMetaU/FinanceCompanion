import React from "react";
import { X } from "lucide-react";
import AuthForm from "./AuthForm";

const AuthModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>

        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-royal mb-2">Welcome</h1>
          <p className="text-blue-700 text-lg font-medium">
            To Your Finance Companion
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-blue-400 mx-auto mt-4 rounded-full"></div>
        </header>

        <AuthForm onSuccess={onClose} />
      </div>
    </div>
  );
};

export default AuthModal;
