import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/lib/ui/tooltip";
import { AlertTriangle } from "lucide-react";

const WarningTooltip = ({ warning }) => {
  if (!warning) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <AlertTriangle className="h-5 w-5 text-amber-500 cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-amber-50 border-amber-200 text-amber-900 p-3">
          <p>{warning}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default WarningTooltip;
