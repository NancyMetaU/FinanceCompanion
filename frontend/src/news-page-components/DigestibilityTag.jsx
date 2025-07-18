import React from "react";

const DigestibilityTag = ({ label, type }) => {
  const getTagColor = () => {
    return type === "boost"
      ? "bg-blue-100 text-blue-800 border-blue-300"
      : "bg-orange-100 text-orange-800 border-orange-300";
  };

  if (!label) return null;

  return (
    <span
      className={`text-[9px] px-1.5 py-0.25 rounded-sm ${getTagColor()} inline-block`}
    >
      {label}
    </span>
  );
};

export default DigestibilityTag;
