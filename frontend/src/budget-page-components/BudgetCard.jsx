import { Card, CardHeader, CardTitle, CardContent } from "@/lib/ui/card";
import RetirementTooltip from "./RetirementTooltip";
import TaxTooltip from "./TaxTooltip";
import WarningTooltip from "./WarningTooltip";
import BudgetItem from "./BudgetItem";

const BudgetCard = ({
  title,
  icon,
  bucketData,
  income,
  color,
  borderColor,
  gradientFrom,
  gradientTo,
}) => {
  return (
    <Card
      className={`border-l-4 ${borderColor} shadow-lg hover:shadow-xl transition-shadow duration-300`}
    >
      <CardHeader
        className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} rounded-t-lg`}
      >
        <CardTitle className="text-xl flex items-center gap-2 text-white">
          <span className="text-2xl">{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ul className="space-y-2">
          <BudgetItem
            label={
              title === "Needs" && bucketData.warning ? (
                <div className="flex items-center gap-1">
                  <span>{title}</span>
                  <WarningTooltip warning={bucketData.warning} />
                </div>
              ) : (
                title
              )
            }
            amount={bucketData.total}
            total={income}
            color={color}
            progressBarColor={
              title === "Needs"
                ? "bg-blue-800"
                : title === "Wants"
                ? "bg-blue-500"
                : "bg-blue-300"
            }
          />

          {title === "Needs" && (
            <>
              <BudgetItem
                label="Recurring Bills"
                amount={bucketData.recurring}
                total={income}
                isSubItem={true}
              />
              {bucketData.taxes && (
                <>
                  <BudgetItem
                    label={
                      <div className="flex items-center gap-1">
                        <span>Taxes</span>
                        <TaxTooltip taxes={bucketData.taxes} />
                      </div>
                    }
                    amount={bucketData.taxes.total}
                    total={income}
                    isSubItem={true}
                  />
                  <div className="pl-4">
                    <BudgetItem
                      label="Federal Tax"
                      amount={bucketData.taxes.breakdown.federal}
                      total={income}
                      isSubItem={true}
                    />
                    <BudgetItem
                      label="State Tax"
                      amount={bucketData.taxes.breakdown.state}
                      total={income}
                      isSubItem={true}
                    />
                    {bucketData.taxes.breakdown.fica ? (
                      <BudgetItem
                        label="FICA (Medicare & Social Security)"
                        amount={bucketData.taxes.breakdown.fica}
                        total={income}
                        isSubItem={true}
                      />
                    ) : (
                      <BudgetItem
                        label="Self-Employment Tax"
                        amount={bucketData.taxes.breakdown.selfEmployment}
                        total={income}
                        isSubItem={true}
                      />
                    )}
                  </div>
                </>
              )}
              <BudgetItem
                label="Extra Allocated"
                amount={bucketData.allocated}
                total={income}
                isSubItem={true}
              />
            </>
          )}

          {title === "Wants" && (
            <>
              {Object.entries(bucketData.categories).map(([key, value]) => (
                <BudgetItem
                  key={key}
                  label={key.replace(/\b\w/g, (l) => l.toUpperCase())}
                  amount={value}
                  total={income}
                  isSubItem={true}
                />
              ))}
              <BudgetItem
                label="Other"
                amount={bucketData.other}
                total={income}
                isSubItem={true}
              />
            </>
          )}

          {title === "Savings" && (
            <>
              <BudgetItem
                label="Long-Term Savings"
                amount={bucketData.longTerm.total}
                total={income}
                isSubItem={true}
              />

              <div className="pl-4">
                <BudgetItem
                  label={
                    <div className="flex items-center gap-1">
                      <span>Retirement</span>
                      <RetirementTooltip
                        retirement={bucketData.longTerm.retirement}
                      />
                    </div>
                  }
                  amount={bucketData.longTerm.retirement.monthlyContribution}
                  total={income}
                  isSubItem={true}
                />

                <BudgetItem
                  label="Other Savings"
                  amount={bucketData.longTerm.other}
                  total={income}
                  isSubItem={true}
                />
              </div>
              <BudgetItem
                label="Debt Payment"
                amount={bucketData.forDebt}
                total={income}
                isSubItem={true}
              />
            </>
          )}
        </ul>
      </CardContent>
    </Card>
  );
};

export default BudgetCard;
