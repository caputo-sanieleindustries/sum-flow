import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Budget {
  id: string;
  user_id: string;
  month: string;
  category_id: string | null;
  amount: number;
  alert_threshold: number;
  alert_sent: boolean;
  created_at: string;
  updated_at: string;
}

export const useBudgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .order("month", { ascending: false });

      if (error) throw error;
      setBudgets(data || []);
    } catch (error: any) {
      toast.error("Errore nel caricamento dei budget");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addBudget = async (budget: Omit<Budget, "id" | "user_id" | "created_at" | "updated_at" | "alert_sent">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utente non autenticato");

      const { data, error } = await supabase
        .from("budgets")
        .insert([{ ...budget, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      toast.success("Budget aggiunto!");
      await fetchBudgets();
      return data;
    } catch (error: any) {
      toast.error(error.message || "Errore nell'aggiunta del budget");
      throw error;
    }
  };

  const updateBudget = async (id: string, budget: Partial<Budget>) => {
    try {
      const { error } = await supabase
        .from("budgets")
        .update(budget)
        .eq("id", id);

      if (error) throw error;
      toast.success("Budget aggiornato!");
      await fetchBudgets();
    } catch (error: any) {
      toast.error(error.message || "Errore nell'aggiornamento del budget");
      throw error;
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Budget eliminato!");
      await fetchBudgets();
    } catch (error: any) {
      toast.error(error.message || "Errore nell'eliminazione del budget");
      throw error;
    }
  };


  useEffect(() => {
    fetchBudgets();
  }, []);

  return {
    budgets,
    loading,
    addBudget,
    updateBudget,
    deleteBudget,
    refetch: fetchBudgets,
  };
};
