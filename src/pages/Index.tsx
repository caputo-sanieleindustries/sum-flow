import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, TrendingUp, PieChart, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
            <Wallet className="h-10 w-10 text-white" />
          </div>
          <h1 className="mb-4 text-5xl font-bold text-white md:text-6xl">
            Budget Manager
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-white/90">
            Monitora le tue entrate e uscite, visualizza grafici dettagliati e prendi il controllo delle tue finanze personali.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link to="/auth">
              <Button size="lg" className="w-full bg-white text-primary hover:bg-white/90 sm:w-auto">
                Inizia Ora
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 sm:w-auto">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Card className="bg-white/10 p-6 backdrop-blur-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">Monitora le Transazioni</h3>
            <p className="text-white/80">
              Aggiungi entrate e uscite facilmente. Categorizza e annota ogni movimento per un controllo completo.
            </p>
          </Card>

          <Card className="bg-white/10 p-6 backdrop-blur-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
              <PieChart className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">Grafici Dettagliati</h3>
            <p className="text-white/80">
              Visualizza l'andamento mensile e la distribuzione delle spese per categoria con grafici interattivi.
            </p>
          </Card>

          <Card className="bg-white/10 p-6 backdrop-blur-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">Sicuro e Privato</h3>
            <p className="text-white/80">
              I tuoi dati sono protetti e accessibili solo a te. Sistema di autenticazione sicuro e affidabile.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
