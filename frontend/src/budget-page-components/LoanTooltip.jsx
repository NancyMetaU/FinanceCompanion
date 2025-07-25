import { Tooltip, TooltipTrigger, TooltipContent } from "@/lib/ui/tooltip";
import { Info } from "lucide-react";

const LoanTooltip = ({ loan }) => {
  if (!loan) return null;

  return (
    <Tooltip>
      <TooltipTrigger>
        <Info className="h-4 w-4 text-blue-500 cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="bg-blue-600 text-white p-3 rounded-md border border-blue-500/20 shadow-lg max-w-xs">
        <div className="text-xs space-y-1">
          <p>
            <strong>{loan.name}</strong> ({loan.type} - {loan.subtype})
          </p>
          <p>
            Balance:{" "}
            <strong>
              $
              {loan.balance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </strong>
          </p>
          <p>
            Interest Rate:{" "}
            <strong>{(loan.interestRate * 100).toFixed(2)}%</strong>
          </p>
          {loan.monthsToPayOff && (
            <p>
              Estimated payoff:{" "}
              <strong>
                {loan.monthsToPayOff} months (~{loan.yearsToPayOff} years)
              </strong>
            </p>
          )}
          {loan.totalInterestPaid && (
            <p>
              Estimated interest:{" "}
              <strong>
                $
                {loan.totalInterestPaid.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </strong>
            </p>
          )}
          <hr className="my-2 border-white/20" />
          <p className="text-[10px] text-white/80">
            Note: This interest rate is a default estimate and may not reflect
            your actual loan terms.
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default LoanTooltip;
