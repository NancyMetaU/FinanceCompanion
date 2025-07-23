import React from "react";
import { DIGESTIBILITY_LABELS } from "../../../backend/constants/digestibility";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/lib/ui/tooltip";

const DigestibilityLabel = ({ label, score }) => {
  const getBadgeColor = () => {
    if (!label) return "bg-gray-200 text-gray-700";
    switch (label) {
      case DIGESTIBILITY_LABELS.HIGH:
        return "bg-green-100 text-green-800 border-green-300";
      case DIGESTIBILITY_LABELS.MODERATE:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case DIGESTIBILITY_LABELS.LOW:
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  if (!label) return null;

  const tooltipText = {
    [DIGESTIBILITY_LABELS.HIGH]:
      "This article will likely be easy to understand.",
    [DIGESTIBILITY_LABELS.MODERATE]:
      "This article may take a bit of effort to understand.",
    [DIGESTIBILITY_LABELS.LOW]: "This article may be harder to digest.",
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`px-1.5 py-0.5 inline-block rounded text-[10px] font-medium cursor-help ${getBadgeColor()}`}
        >
          {label}
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        align="center"
        sideOffset={6}
        className="max-w-[200px] p-2 text-xs leading-snug text-center"
      >
        <p className="font-semibold">
          Score: <strong>{score}/100</strong>
        </p>
        <p className="mt-1 text-gray-400">{tooltipText[label]}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default DigestibilityLabel;
