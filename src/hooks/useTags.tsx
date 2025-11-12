import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface TransactionTag {
  id: string;
  transaction_id: string;
  tag_id: string;
  created_at: string;
}

export const useTags = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name");

      if (error) throw error;
      setTags(data || []);
    } catch (error: any) {
      toast.error("Errore nel caricamento dei tag");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createTag = async (name: string, color: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utente non autenticato");

      const { data, error } = await supabase
        .from("tags")
        .insert([{ name, color, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      setTags(prev => [...prev, data]);
      toast.success("Tag creato!");
      return data;
    } catch (error: any) {
      toast.error(error.message || "Errore nella creazione del tag");
      throw error;
    }
  };

  const updateTag = async (id: string, name: string, color: string) => {
    try {
      const { error } = await supabase
        .from("tags")
        .update({ name, color })
        .eq("id", id);

      if (error) throw error;
      
      setTags(prev => prev.map(t => t.id === id ? { ...t, name, color } : t));
      toast.success("Tag aggiornato!");
    } catch (error: any) {
      toast.error(error.message || "Errore nell'aggiornamento del tag");
      throw error;
    }
  };

  const deleteTag = async (id: string) => {
    try {
      const { error } = await supabase
        .from("tags")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setTags(prev => prev.filter(t => t.id !== id));
      toast.success("Tag eliminato!");
    } catch (error: any) {
      toast.error(error.message || "Errore nell'eliminazione del tag");
      throw error;
    }
  };

  const getTransactionTags = async (transactionId: string): Promise<Tag[]> => {
    try {
      const { data, error } = await supabase
        .from("transaction_tags")
        .select("tag_id, tags(*)")
        .eq("transaction_id", transactionId);

      if (error) throw error;
      return data?.map(item => item.tags).filter(Boolean) as Tag[] || [];
    } catch (error: any) {
      console.error("Error fetching transaction tags:", error);
      return [];
    }
  };

  const setTransactionTags = async (transactionId: string, tagIds: string[]) => {
    try {
      // Delete existing tags
      await supabase
        .from("transaction_tags")
        .delete()
        .eq("transaction_id", transactionId);

      // Insert new tags
      if (tagIds.length > 0) {
        const { error } = await supabase
          .from("transaction_tags")
          .insert(tagIds.map(tagId => ({
            transaction_id: transactionId,
            tag_id: tagId
          })));

        if (error) throw error;
      }
    } catch (error: any) {
      console.error("Error setting transaction tags:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return {
    tags,
    loading,
    createTag,
    updateTag,
    deleteTag,
    getTransactionTags,
    setTransactionTags,
    refetch: fetchTags
  };
};
