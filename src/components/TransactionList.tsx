import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { TransactionCard } from "@/components/TransactionCard";
import { EditTransactionDialog } from "@/components/EditTransactionDialog";
import { useTransactions, Transaction, TransactionType } from "@/hooks/useTransactions";
import { Wallet } from "lucide-react";

export function TransactionList() {
  const { transactions, categories, deleteTransaction } = useTransactions();
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Generate list of available months from transactions
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      months.add(monthKey);
    });
    return Array.from(months).sort().reverse();
  }, [transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Filter by month
      if (selectedMonth !== "all") {
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (monthKey !== selectedMonth) return false;
      }

      // Filter by category
      if (selectedCategory !== "all" && transaction.category_id !== selectedCategory) {
        return false;
      }

      // Filter by type
      if (selectedType !== "all" && transaction.type !== selectedType) {
        return false;
      }

      return true;
    });
  }, [transactions, selectedMonth, selectedCategory, selectedType]);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteTransaction(deletingId);
      setDeletingId(null);
    } catch (error) {
      console.error("Errore nell'eliminazione:", error);
    }
  };

  const formatMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
  };

  return (
    <>
      <Card className="bg-card p-6 shadow-card">
        <h2 className="mb-6 text-xl font-semibold">Transazioni</h2>

        {/* Filters */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="month-filter" className="mb-2 block">
              Mese
            </Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger id="month-filter">
                <SelectValue placeholder="Tutti i mesi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i mesi</SelectItem>
                {availableMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {formatMonthLabel(month)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category-filter" className="mb-2 block">
              Categoria
            </Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="category-filter">
                <SelectValue placeholder="Tutte le categorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le categorie</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <span className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="type-filter" className="mb-2 block">
              Tipo
            </Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger id="type-filter">
                <SelectValue placeholder="Tutti i tipi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i tipi</SelectItem>
                <SelectItem value="income">Entrate</SelectItem>
                <SelectItem value="expense">Uscite</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Transaction list */}
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Wallet className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              {transactions.length === 0
                ? "Nessuna transazione ancora"
                : "Nessuna transazione corrisponde ai filtri selezionati"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {transactions.length === 0
                ? "Inizia aggiungendo la tua prima entrata o uscita"
                : "Prova a modificare i filtri"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="mb-4 text-sm text-muted-foreground">
              {filteredTransactions.length} transazion
              {filteredTransactions.length === 1 ? "e" : "i"}
              {selectedMonth !== "all" || selectedCategory !== "all" || selectedType !== "all"
                ? " (filtrate)"
                : ""}
            </p>
            {filteredTransactions.map((transaction) => {
              const category = categories.find((c) => c.id === transaction.category_id);
              return (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  category={category}
                  onEdit={setEditingTransaction}
                  onDelete={setDeletingId}
                />
              );
            })}
          </div>
        )}
      </Card>

      <EditTransactionDialog
        transaction={editingTransaction}
        open={!!editingTransaction}
        onOpenChange={(open) => !open && setEditingTransaction(null)}
      />

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. La transazione verrà eliminata
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
