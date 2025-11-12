import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, Wallet, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [selectedMonth] = useState(new Date().toLocaleDateString("it-IT", { month: "long", year: "numeric" }));
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

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
                <p className="mt-2 text-3xl font-bold text-success">€0,00</p>
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
                <p className="mt-2 text-3xl font-bold text-warning">€0,00</p>
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
                <p className="mt-2 text-3xl font-bold text-primary">€0,00</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex gap-4">
          <Button className="bg-success hover:bg-success/90">
            <Plus className="mr-2 h-4 w-4" />
            Nuova Entrata
          </Button>
          <Button className="bg-warning hover:bg-warning/90">
            <Plus className="mr-2 h-4 w-4" />
            Nuova Uscita
          </Button>
        </div>

        {/* Transactions List */}
        <Card className="mt-8 bg-card p-6 shadow-card">
          <h2 className="mb-4 text-xl font-semibold">Transazioni Recenti</h2>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Wallet className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">Nessuna transazione ancora</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Inizia aggiungendo la tua prima entrata o uscita
            </p>
          </div>
        </Card>

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
