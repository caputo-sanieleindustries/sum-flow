import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { TransactionDialog } from "@/components/TransactionDialog";
import { TransactionList } from "@/components/TransactionList";
import { useTransactions } from "@/hooks/useTransactions";

const Dashboard = () => {
  const [selectedMonth] = useState(new Date().toLocaleDateString("it-IT", { month: "long", year: "numeric" }));
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { transactions } = useTransactions();

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
      <header className="bg-gradient-primary px-4 py-8 md:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white md:text-4xl">Budget Manager</h1>
            <p className="mt-2 text-white/90">{selectedMonth}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/80">{user.email}</span>
            <Button variant="outline" size="sm" onClick={signOut} className="border-white/20 text-white hover:bg-white/10">
              <LogOut className="mr-2 h-4 w-4" />
              Esci
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-12">
        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-gradient-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Entrate</p>
                <p className="mt-2 text-3xl font-bold text-success">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
              <div className="rounded-full bg-success/10 p-3">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Uscite</p>
                <p className="mt-2 text-3xl font-bold text-warning">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
              <div className="rounded-full bg-warning/10 p-3">
                <TrendingDown className="h-6 w-6 text-warning" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saldo Netto</p>
                <p className="mt-2 text-3xl font-bold text-primary">
                  {formatCurrency(netBalance)}
                </p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap gap-4">
          <TransactionDialog type="income" variant="income" />
          <TransactionDialog type="expense" variant="expense" />
        </div>

        {/* Transactions List */}
        <div className="mt-8">
          <TransactionList />
        </div>

        {/* Charts Placeholder */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card className="bg-card p-6 shadow-card">
            <h3 className="mb-4 text-lg font-semibold">Andamento Mensile</h3>
            <div className="flex h-64 items-center justify-center rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground">Grafico disponibile con dati</p>
            </div>
          </Card>

          <Card className="bg-card p-6 shadow-card">
            <h3 className="mb-4 text-lg font-semibold">Spese per Categoria</h3>
            <div className="flex h-64 items-center justify-center rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground">Grafico disponibile con dati</p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
