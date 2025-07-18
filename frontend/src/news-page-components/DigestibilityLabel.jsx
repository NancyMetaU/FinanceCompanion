import React from "react";

const DigestibilityLabel = ({ label, score }) => {
  const getBadgeColor = () => {
    if (!label) return "bg-gray-200 text-gray-700";

    switch (label) {
      case "Highly Digestible":
        return "bg-green-100 text-green-800 border-green-300";
      case "Moderately Digestible":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Low Digestibility":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  if (!label) return null;

  return (
    <div
      className={`px-1.5 py-0.5 inline-block rounded text-[10px] font-medium ${getBadgeColor()}`}
    >
      {label}
    </div>
  );
};

export default DigestibilityLabel;
