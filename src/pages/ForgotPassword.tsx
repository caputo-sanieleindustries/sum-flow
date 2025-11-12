import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Request password reset from Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      // Send custom email via our edge function
      const { error: emailError } = await supabase.functions.invoke("send-reset-email", {
        body: {
          email,
          resetLink: `${window.location.origin}/reset-password`,
        },
      });

      if (emailError) {
        console.error("Email sending error:", emailError);
        // Don't fail the whole operation if custom email fails
      }

      setEmailSent(true);
      toast.success("Email di recupero inviata!");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Errore nell'invio dell'email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-primary p-4">
      <Card className="w-full max-w-md bg-card p-8 shadow-medium">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <Wallet className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Password Dimenticata?</h1>
          <p className="mt-2 text-muted-foreground">
            {emailSent
              ? "Controlla la tua email"
              : "Inserisci il tuo indirizzo email per ricevere le istruzioni"}
          </p>
        </div>

        {emailSent ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-success/10 p-4 text-center">
              <p className="text-sm text-success">
                ✅ Abbiamo inviato un'email a <strong>{email}</strong> con le istruzioni per
                reimpostare la tua password.
              </p>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Non hai ricevuto l'email? Controlla la cartella spam o riprova tra qualche minuto.
            </p>
            <Link to="/auth" className="block">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Torna al Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@esempio.it"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover"
              disabled={isLoading}
            >
              {isLoading ? "Invio in corso..." : "Invia Link di Recupero"}
            </Button>

            <Link to="/auth" className="block">
              <Button variant="link" className="w-full text-sm text-muted-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Torna al Login
              </Button>
            </Link>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;
