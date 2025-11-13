import { useState, useEffect } from "react";
import { Download, Trash2, FileText, Image as ImageIcon, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Receipt, useReceipts } from "@/hooks/useReceipts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ReceiptListProps {
  transactionId: string;
  onReceiptsChange?: () => void;
}

export function ReceiptList({ transactionId, onReceiptsChange }: ReceiptListProps) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { getReceipts, deleteReceipt, getReceiptUrl, loading } = useReceipts();

  const loadReceipts = async () => {
    const data = await getReceipts(transactionId);
    setReceipts(data);
  };

  useEffect(() => {
    if (transactionId) {
      loadReceipts();
    }
  }, [transactionId]);

  const handleDelete = async (receipt: Receipt) => {
    const success = await deleteReceipt(receipt.id, receipt.file_path);
    if (success) {
      await loadReceipts();
      onReceiptsChange?.();
    }
    setDeleteId(null);
  };

  const handleView = (receipt: Receipt) => {
    const url = getReceiptUrl(receipt.file_path);
    window.open(url, "_blank");
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Caricamento ricevute...</p>;
  }

  if (receipts.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-2">
        <p className="text-sm font-medium">Ricevute allegate ({receipts.length})</p>
        {receipts.map((receipt) => (
          <Card key={receipt.id} className="p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {getFileIcon(receipt.content_type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{receipt.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(receipt.file_size)}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => handleView(receipt)}
                  title="Visualizza"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleteId(receipt.id)}
                  title="Elimina"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questa ricevuta? L'operazione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const receipt = receipts.find((r) => r.id === deleteId);
                if (receipt) handleDelete(receipt);
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
