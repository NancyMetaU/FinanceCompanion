import React from "react";

const ErrorMessage = ({ message = "Something went wrong." }) => {
  return (
    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
      <p>{message}</p>
    </div>
  );
};

export default ErrorMessage;
