import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { TransactionDialog } from "@/components/TransactionDialog";
import { TransactionList } from "@/components/TransactionList";
import { MonthlyChart } from "@/components/MonthlyChart";
import { CategoryChart } from "@/components/CategoryChart";
import { OnlineStatusBadge } from "@/components/OnlineStatusBadge";
import { TagManager } from "@/components/TagManager";
import { ExportTransactions } from "@/components/ExportTransactions";
import { BudgetManager } from "@/components/BudgetManager";
import { BudgetProgress } from "@/components/BudgetProgress";
import { AdvancedStats } from "@/components/AdvancedStats";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CategoryManager } from "@/components/CategoryManager";
import { useTransactions } from "@/hooks/useTransactions";

const Dashboard = () => {
  const [selectedMonth] = useState(new Date().toLocaleDateString("it-IT", { month: "long", year: "numeric" }));
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { transactions, categories, isOnline, isSyncing } = useTransactions();

  // Calculate totals
  const { totalIncome, totalExpenses, netBalance } = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netBalance: income - expenses,
    };
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-muted-foreground">Caricamento...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background px-4 py-6 md:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground md:text-4xl">Budget Manager</h1>
              <OnlineStatusBadge isOnline={isOnline} isSyncing={isSyncing} />
            </div>
            <p className="mt-2 text-muted-foreground">{selectedMonth}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <ThemeToggle />
            <Button variant="expense" size="sm" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Esci
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-12">
        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Entrate</p>
                <p className="mt-2 text-3xl font-bold text-income">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
              <div className="rounded-full bg-income/10 p-3">
                <TrendingUp className="h-6 w-6 text-income" />
              </div>
            </div>
          </Card>

          <Card className="border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Uscite</p>
                <p className="mt-2 text-3xl font-bold text-expense">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
              <div className="rounded-full bg-expense/10 p-3">
                <TrendingDown className="h-6 w-6 text-expense" />
              </div>
            </div>
          </Card>

          <Card className="border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saldo Netto</p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {formatCurrency(netBalance)}
                </p>
              </div>
              <div className="rounded-full bg-muted p-3">
                <Wallet className="h-6 w-6 text-foreground" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap gap-4">
          <TransactionDialog type="income" variant="income" />
          <TransactionDialog type="expense" variant="expense" />
          <TagManager />
          <BudgetManager />
          <ExportTransactions />
        </div>

        {/* Budget Progress */}
        <div className="mt-8">
          <BudgetProgress />
        </div>

        {/* Advanced Stats */}
        <div className="mt-8">
          <AdvancedStats />
        </div>

        {/* Category Manager */}
        <div className="mt-8">
          <CategoryManager />
        </div>

        {/* Transactions List */}
        <div className="mt-8">
          <TransactionList />
        </div>

        {/* Charts */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <MonthlyChart transactions={transactions} />
          <CategoryChart transactions={transactions} categories={categories} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
