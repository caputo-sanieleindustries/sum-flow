import { supabase } from "@/integrations/supabase/client";
import { useBudgets } from "./useBudgets";

export const useBudgetAlerts = () => {
  const { budgets, updateBudget } = useBudgets();

  const checkBudgetAlert = async (monthDate: Date, categoryId: string | null, spent: number) => {
    const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}-01`;
    
    const budget = budgets.find(
      b => b.month === monthKey && b.category_id === categoryId
    );

    if (budget && !budget.alert_sent) {
      const percentage = spent / budget.amount;
      if (percentage >= budget.alert_threshold) {
        // Send alert via edge function
        try {
          const { data: { user } } = await supabase.auth.getUser();
          await supabase.functions.invoke("budget-alert", {
            body: {
              budget_id: budget.id,
              user_email: user?.email,
              category_id: categoryId,
              amount: budget.amount,
              spent: spent,
              percentage: Math.round(percentage * 100),
            },
          });

          // Mark alert as sent
          await updateBudget(budget.id, { alert_sent: true });
        } catch (error) {
          console.error("Error sending budget alert:", error);
        }
      }
    }
  };

  return { checkBudgetAlert };
};
