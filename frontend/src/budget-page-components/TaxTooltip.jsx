import { Tooltip, TooltipTrigger, TooltipContent } from "@/lib/ui/tooltip";
import { Info } from "lucide-react";

const TaxTooltip = ({ taxes }) => {
  if (!taxes) return null;

  const isFreelancer = Boolean(taxes.breakdown.selfEmployment);

  return (
    <Tooltip>
      <TooltipTrigger>
        <Info className="h-4 w-4 text-blue-500 cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="bg-blue-600 text-white p-3 rounded-md border border-blue-500/20 shadow-lg max-w-xs">
        <div className="text-xs">
          <h3 className="text-sm font-bold mb-2 pb-1 border-b border-white/30">
            {isFreelancer
              ? "Freelancer Tax Breakdown"
              : "W-2 Employee Tax Breakdown"}
          </h3>

          <div className="space-y-1.5 mt-2">
            {isFreelancer ? (
              <>
                <div className="grid">
                  <span className="text-blue-200">
                    Self-Employment Tax (15.3%)
                  </span>
                  <span className="text-xs text-white/90">
                    Covers both employer and employee portions of Social
                    Security and Medicare taxes
                  </span>
                </div>

                <div className="grid">
                  <span className="text-blue-200">Federal Income Tax</span>
                  <span className="text-xs text-white/90">
                    Estimated based on a 12% tax bracket
                  </span>
                </div>

                <div className="grid">
                  <span className="text-blue-200">State Income Tax</span>
                  <span className="text-xs text-white/90">
                    Estimated at 5% of income
                  </span>
                </div>

                <p className="text-yellow-300 mt-3 text-[11px]">
                  Remember to set aside this amount monthly for quarterly
                  estimated tax payments
                </p>
              </>
            ) : (
              <>
                <div className="grid">
                  <span className="text-blue-200">Federal Income Tax</span>
                  <span className="text-xs text-white/90">
                    Estimated based on your income bracket (12-18% depending on
                    income level)
                  </span>
                </div>

                <div className="grid">
                  <span className="text-blue-200">State Income Tax</span>
                  <span className="text-xs text-white/90">
                    Estimated at 5% of income
                  </span>
                </div>

                <div className="grid">
                  <span className="text-blue-200">FICA</span>
                  <span className="text-xs text-white/90">
                    7.65% covering Social Security (6.2%) and Medicare (1.45%)
                  </span>
                </div>
              </>
            )}
          </div>

          <hr className="my-2 border-white/20" />
          <p className="text-[10px] text-white/80">
            These are estimates only. Your actual tax liability may vary based
            on deductions, credits, and other factors.{" "}
            <a
              href="https://www.irs.gov/individuals/tax-withholding-estimator"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-200 hover:text-white"
            >
              Use the IRS Tax Withholding Estimator
            </a>{" "}
            for more accurate calculations.
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default TaxTooltip;
