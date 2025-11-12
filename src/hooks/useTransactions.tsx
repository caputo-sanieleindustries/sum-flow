import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLocalStorage } from "./useLocalStorage";
import { useOnlineStatus } from "./useOnlineStatus";

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

interface CachedData {
  transactions: Transaction[];
  categories: Category[];
  lastSync: string;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [cachedData, setCachedData] = useLocalStorage<CachedData | null>("budget-cache", null);
  const isOnline = useOnlineStatus();
  const [isSyncing, setIsSyncing] = useState(false);

  // Load from cache on mount
  useEffect(() => {
    if (cachedData) {
      setTransactions(cachedData.transactions);
      setCategories(cachedData.categories);
      console.log("Loaded from cache:", cachedData.transactions.length, "transactions");
    }
  }, []);

  // Save to cache whenever data changes
  useEffect(() => {
    if (transactions.length > 0 || categories.length > 0) {
      setCachedData({
        transactions,
        categories,
        lastSync: new Date().toISOString(),
      });
    }
  }, [transactions, categories]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
      return data || [];
    } catch (error: any) {
      // If offline, use cached data
      if (!isOnline && cachedData?.categories) {
        console.log("Using cached categories (offline)");
        return cachedData.categories;
      }
      toast.error("Errore nel caricamento delle categorie");
      console.error(error);
      return [];
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
      return data || [];
    } catch (error: any) {
      // If offline, use cached data
      if (!isOnline && cachedData?.transactions) {
        console.log("Using cached transactions (offline)");
        setTransactions(cachedData.transactions);
        toast.info("Modalità offline: visualizzazione dati in cache");
        return cachedData.transactions;
      }
      toast.error("Errore nel caricamento delle transazioni");
      console.error(error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Sync with backend when coming back online
  useEffect(() => {
    if (isOnline && !isSyncing) {
      const syncData = async () => {
        setIsSyncing(true);
        console.log("Syncing with backend...");
        try {
          await Promise.all([fetchCategories(), fetchTransactions()]);
          toast.success("Dati sincronizzati con il server");
        } catch (error) {
          console.error("Sync error:", error);
        } finally {
          setIsSyncing(false);
        }
      };

      syncData();
    }
  }, [isOnline]);

  const addTransaction = async (transaction: Omit<Transaction, "id" | "user_id" | "created_at" | "updated_at">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utente non autenticato");

      if (!isOnline) {
        toast.error("Impossibile aggiungere transazioni offline. Riprova quando sei connesso.");
        throw new Error("Offline");
      }

      const { error } = await supabase
        .from("transactions")
        .insert([{ ...transaction, user_id: user.id }]);

      if (error) throw error;
      // Realtime will handle the update automatically
      toast.success("Transazione aggiunta!");
    } catch (error: any) {
      if (error.message !== "Offline") {
        toast.error(error.message || "Errore nell'aggiunta della transazione");
      }
      throw error;
    }
  };

  const updateTransaction = async (id: string, transaction: Partial<Transaction>) => {
    try {
      if (!isOnline) {
        toast.error("Impossibile modificare transazioni offline. Riprova quando sei connesso.");
        throw new Error("Offline");
      }

      const { error } = await supabase
        .from("transactions")
        .update(transaction)
        .eq("id", id);

      if (error) throw error;
      // Realtime will handle the update automatically
      toast.success("Transazione aggiornata!");
    } catch (error: any) {
      if (error.message !== "Offline") {
        toast.error(error.message || "Errore nell'aggiornamento della transazione");
      }
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      if (!isOnline) {
        toast.error("Impossibile eliminare transazioni offline. Riprova quando sei connesso.");
        throw new Error("Offline");
      }

      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      // Realtime will handle the update automatically
      toast.success("Transazione eliminata!");
    } catch (error: any) {
      if (error.message !== "Offline") {
        toast.error(error.message || "Errore nell'eliminazione della transazione");
      }
      throw error;
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, []);

  // Realtime subscription for transactions
  useEffect(() => {
    const channel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions'
        },
        (payload) => {
          console.log('Realtime update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setTransactions((prev) => [payload.new as Transaction, ...prev]);
            toast.success("Nuova transazione ricevuta!");
          } else if (payload.eventType === 'UPDATE') {
            setTransactions((prev) =>
              prev.map((t) => (t.id === payload.new.id ? payload.new as Transaction : t))
            );
            toast.info("Transazione aggiornata!");
          } else if (payload.eventType === 'DELETE') {
            setTransactions((prev) => prev.filter((t) => t.id !== payload.old.id));
            toast.info("Transazione eliminata!");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    transactions,
    categories,
    loading,
    isOnline,
    isSyncing,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions
  };
};
