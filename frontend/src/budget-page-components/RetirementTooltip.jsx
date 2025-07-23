import { Tooltip, TooltipTrigger, TooltipContent } from "@/lib/ui/tooltip";
import { Info } from "lucide-react";

const RetirementTooltip = ({ retirement }) => {
  if (!retirement) return null;

  return (
    <Tooltip>
      <TooltipTrigger>
        <Info className="h-4 w-4 text-blue-500 cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="bg-blue-600 text-white p-3 rounded-md border border-blue-500/20 shadow-lg max-w-xs">
        <div className="text-xs space-y-1">
          <p>
            Current Roth balance:{" "}
            <strong>
              $
              {retirement.accountBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </strong>
          </p>
          <p>
            Monthly contribution:{" "}
            <strong>
              $
              {retirement.monthlyContribution.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </strong>
          </p>
          <p>
            Projected balance by April:{" "}
            <strong>
              $
              {retirement.projectedBalanceByTaxDeadline.toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 2,
                }
              )}
            </strong>
          </p>
          {retirement.alreadyMaxedOut ? (
            <p className="text-green-300">
              Already maxed out this year’s contribution limit.
            </p>
          ) : retirement.willMaxOut ? (
            <p className="text-green-300">
              On track to max out in {retirement.monthsTillMax} month
              {retirement.monthsTillMax > 1 ? "s" : ""}.
            </p>
          ) : (
            <p className="text-yellow-300">
              Will not reach the annual contribution limit at this rate.
            </p>
          )}
          <hr className="my-2 border-white/20" />
          <p className="text-[10px] text-white/80">
            Based on the general <strong>$7,000</strong> annual Roth IRA limit
            for users under age 50.{" "}
            <a
              href="https://www.irs.gov/retirement-plans/roth-iras"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-200 hover:text-white"
            >
              Confirm your limit
            </a>
            .
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default RetirementTooltip;
