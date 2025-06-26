import React from "react";

const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="loading-spinner">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  );
};

export default Loading;
