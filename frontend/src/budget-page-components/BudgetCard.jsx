import { Card, CardHeader, CardTitle, CardContent } from "@/lib/ui/card";
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
            label={title}
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
                amount={bucketData.longTerm}
                total={income}
                isSubItem={true}
              />
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
