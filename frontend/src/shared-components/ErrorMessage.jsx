import React from "react";

const ErrorMessage = ({ message = "Something went wrong." }) => {
  return (
    <div className="error-message">
      <p>{message}</p>
    </div>
  );
};

export default ErrorMessage;
