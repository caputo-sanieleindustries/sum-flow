import { useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useBudgets } from "@/hooks/useBudgets";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudgetAlerts } from "@/hooks/useBudgetAlerts";
import { AlertTriangle, TrendingDown } from "lucide-react";

export function BudgetProgress() {
  const { budgets } = useBudgets();
  const { transactions, categories } = useTransactions();
  const { checkBudgetAlert } = useBudgetAlerts();

  const currentMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  }, []);

  const budgetProgress = useMemo(() => {
    const currentBudgets = budgets.filter(b => b.month === currentMonth);
    
    return currentBudgets.map(budget => {
      const spent = transactions
        .filter(t => {
          const transactionDate = new Date(t.date);
          const transactionMonth = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, "0")}-01`;
          
          if (transactionMonth !== currentMonth) return false;
          if (t.type !== "expense") return false;
          if (budget.category_id && t.category_id !== budget.category_id) return false;
          if (!budget.category_id && t.category_id) return true;
          
          return true;
        })
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

      const percentage = (spent / budget.amount) * 100;
      const category = budget.category_id 
        ? categories.find(c => c.id === budget.category_id)
        : null;

      return {
        ...budget,
        spent,
        percentage,
        category,
        isOverBudget: percentage >= 100,
        isNearLimit: percentage >= budget.alert_threshold * 100 && percentage < 100,
      };
    });
  }, [budgets, transactions, categories, currentMonth]);

  // Check for budget alerts
  useEffect(() => {
    budgetProgress.forEach(budget => {
      if (budget.isNearLimit && !budget.alert_sent) {
        const now = new Date();
        checkBudgetAlert(now, budget.category_id, budget.spent);
      }
    });
  }, [budgetProgress]);

  if (budgetProgress.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 shadow-card">
      <div className="mb-4 flex items-center gap-2">
        <TrendingDown className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Budget Mensile</h2>
      </div>

      <div className="space-y-4">
        {budgetProgress.map((budget) => (
          <div key={budget.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {budget.category ? `${budget.category.icon} ${budget.category.name}` : "Budget Totale"}
                </span>
                {budget.isOverBudget && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Superato
                  </Badge>
                )}
                {budget.isNearLimit && !budget.isOverBudget && (
                  <Badge variant="secondary" className="flex items-center gap-1 bg-warning/10 text-warning">
                    <AlertTriangle className="h-3 w-3" />
                    Vicino al limite
                  </Badge>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {new Intl.NumberFormat("it-IT", {
                  style: "currency",
                  currency: "EUR",
                }).format(budget.spent)}{" "}
                / {" "}
                {new Intl.NumberFormat("it-IT", {
                  style: "currency",
                  currency: "EUR",
                }).format(budget.amount)}
              </span>
            </div>
            <Progress 
              value={Math.min(budget.percentage, 100)} 
              className={budget.isOverBudget ? "bg-destructive/20" : ""}
            />
            <p className="text-xs text-muted-foreground">
              {budget.percentage.toFixed(1)}% utilizzato
              {budget.isOverBudget && ` (${(budget.percentage - 100).toFixed(1)}% oltre il limite)`}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
