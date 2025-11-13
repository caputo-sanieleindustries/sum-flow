import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Receipt {
  id: string;
  transaction_id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  content_type: string | null;
  created_at: string;
}

export function useReceipts() {
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const uploadReceipt = async (transactionId: string, file: File): Promise<Receipt | null> => {
    if (!file) return null;

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Il file è troppo grande. Dimensione massima: 5MB");
      return null;
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Tipo di file non supportato. Usa JPG, PNG, WEBP o PDF");
      return null;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utente non autenticato");

      // Create unique file path
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${transactionId}/${Date.now()}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await (supabase as any).storage
        .from("receipts")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save receipt record to database
      const { data: receipt, error: dbError } = await (supabase as any)
        .from("receipts")
        .insert({
          transaction_id: transactionId,
          file_name: file.name,
          file_path: fileName,
          file_size: file.size,
          content_type: file.type,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast.success("Ricevuta caricata con successo");
      return receipt as Receipt;
    } catch (error) {
      console.error("Errore nel caricamento della ricevuta:", error);
      toast.error("Errore nel caricamento della ricevuta");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const getReceipts = async (transactionId: string): Promise<Receipt[]> => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("receipts")
        .select("*")
        .eq("transaction_id", transactionId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Receipt[];
    } catch (error) {
      console.error("Errore nel recupero delle ricevute:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const deleteReceipt = async (receiptId: string, filePath: string): Promise<boolean> => {
    try {
      // Delete from storage
      const { error: storageError } = await (supabase as any).storage
        .from("receipts")
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await (supabase as any)
        .from("receipts")
        .delete()
        .eq("id", receiptId);

      if (dbError) throw dbError;

      toast.success("Ricevuta eliminata");
      return true;
    } catch (error) {
      console.error("Errore nell'eliminazione della ricevuta:", error);
      toast.error("Errore nell'eliminazione della ricevuta");
      return false;
    }
  };

  const getReceiptUrl = (filePath: string): string => {
    const { data } = (supabase as any).storage
      .from("receipts")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  return {
    uploadReceipt,
    getReceipts,
    deleteReceipt,
    getReceiptUrl,
    uploading,
    loading,
  };
}
