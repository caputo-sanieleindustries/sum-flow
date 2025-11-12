import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: TransactionType;
  category_id: string | null;
  date: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast.error("Errore nel caricamento delle categorie");
      console.error(error);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      toast.error("Errore nel caricamento delle transazioni");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, "id" | "user_id" | "created_at" | "updated_at">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utente non autenticato");

      const { error } = await supabase
        .from("transactions")
        .insert([{ ...transaction, user_id: user.id }]);

      if (error) throw error;
      toast.success("Transazione aggiunta!");
      await fetchTransactions();
    } catch (error: any) {
      toast.error(error.message || "Errore nell'aggiunta della transazione");
      throw error;
    }
  };

  const updateTransaction = async (id: string, transaction: Partial<Transaction>) => {
    try {
      const { error } = await supabase
        .from("transactions")
        .update(transaction)
        .eq("id", id);

      if (error) throw error;
      toast.success("Transazione aggiornata!");
      await fetchTransactions();
    } catch (error: any) {
      toast.error(error.message || "Errore nell'aggiornamento della transazione");
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Transazione eliminata!");
      await fetchTransactions();
    } catch (error: any) {
      toast.error(error.message || "Errore nell'eliminazione della transazione");
      throw error;
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, []);

  return {
    transactions,
    categories,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions
  };
};
