import React from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/lib/ui/tooltip";

const DigestibilityTag = ({ label, type, impact }) => {
  const getTagColor = () => {
    return type === "boost"
      ? "bg-blue-100 text-blue-800 border-blue-300"
      : "bg-orange-100 text-orange-800 border-orange-300";
  };

  if (!label) return null;

  const maxImpacts = {
    "Complex": -100,
    "Familiar": 6,
    "Well-rated": 6,
    "Poorly-rated": -6,
    "Read similar": 12,
    "Liked similar": 10,
    "Disliked similar": -10,
    "Fresh topic": 3,
    "Time-intensive": -10,
    "Similar time-intensive": -8,
  };

  const explanations = {
    "Complex":
      "The article contains complex language, long sentences, or specialized terminology.",
    "Familiar":
      "You've read other articles from this industry before.",
    "Well-rated":
      "You've positively rated similar articles in this industry.",
    "Poorly-rated":
      "You've negatively rated similar articles in this industry.",
    "Read similar":
      "You've read articles similar to this one.",
    "Liked similar":
      "You've positively rated articles similar to this one.",
    "Disliked similar":
      "You've negatively rated articles similar to this one.",
    "Fresh topic":
      "This article covers a new angle on a familiar industry.",
    "Time-intensive":
      "You spent more time than usual reading articles from this industry.",
    "Similar time-intensive":
      "You typically spend more time on articles similar to this one.",
  };

  const max = maxImpacts[label] ?? null;
  const absMax = max ? Math.abs(max) : null;
  const ratio =
    impact !== undefined && max !== null
      ? `${impact > 0 ? "+" : ""}${impact}/${absMax} points`
      : "Variable";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`text-[9px] px-1.5 py-0.5 rounded-sm ${getTagColor()} inline-block cursor-help`}
        >
          {label}
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        align="center"
        sideOffset={6}
        className="max-w-[200px] p-2 text-xs leading-snug text-center"
      >
        <p className="font-semibold">
          {type === "boost" ? "Positive Factor" : "Challenge Factor"}
        </p>
        <p className="mt-1 font-medium">
          Impact: <span className="font-normal">{ratio}</span>
        </p>
        <p className="mt-1 text-gray-400">{explanations[label]}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default DigestibilityTag;
