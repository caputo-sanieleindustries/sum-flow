import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { useTags } from "@/hooks/useTags";
import { toast } from "sonner";

export function ExportTransactions() {
  const { transactions, categories } = useTransactions();
  const { getTransactionTags } = useTags();
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      // Prepare data with tags
      const dataWithTags = await Promise.all(
        transactions.map(async (transaction) => {
          const category = categories.find(c => c.id === transaction.category_id);
          const tags = await getTransactionTags(transaction.id);
          
          return {
            data: transaction.date,
            tipo: transaction.type === "income" ? "Entrata" : "Uscita",
            importo: transaction.amount,
            categoria: category?.name || "N/A",
            nota: transaction.note || "",
            tag: tags.map(t => t.name).join("; "),
          };
        })
      );

      // Create CSV content
      const headers = ["Data", "Tipo", "Importo", "Categoria", "Nota", "Tag"];
      const csvContent = [
        headers.join(","),
        ...dataWithTags.map(row => 
          [
            row.data,
            row.tipo,
            row.importo,
            `"${row.categoria}"`,
            `"${row.nota.replace(/"/g, '""')}"`,
            `"${row.tag.replace(/"/g, '""')}"`,
          ].join(",")
        ),
      ].join("\n");

      // Create and download file
      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `transazioni_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Transazioni esportate con successo!");
    } catch (error) {
      console.error("Errore nell'export:", error);
      toast.error("Errore durante l'esportazione");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={exportToCSV}
      disabled={isExporting || transactions.length === 0}
      variant="outline"
    >
      <Download className="mr-2 h-4 w-4" />
      {isExporting ? "Esportazione..." : "Esporta CSV"}
    </Button>
  );
}
