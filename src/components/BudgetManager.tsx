import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PiggyBank } from "lucide-react";
import { useBudgets } from "@/hooks/useBudgets";
import { useTransactions } from "@/hooks/useTransactions";

export function BudgetManager() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [threshold, setThreshold] = useState("80");
  const [month, setMonth] = useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
  );
  const { addBudget } = useBudgets();
  const { categories } = useTransactions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await addBudget({
        month: `${month}-01`,
        category_id: categoryId === "all" ? null : categoryId,
        amount: parseFloat(amount),
        alert_threshold: parseFloat(threshold) / 100,
      });

      setAmount("");
      setCategoryId("all");
      setThreshold("80");
      setOpen(false);
    } catch (error) {
      console.error("Errore nell'aggiunta del budget:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PiggyBank className="mr-2 h-4 w-4" />
          Gestisci Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Imposta Budget Mensile</DialogTitle>
            <DialogDescription>
              Definisci un limite di spesa per categoria o totale mensile
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="month">Mese</Label>
              <Input
                id="month"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Budget totale (tutte le categorie)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Budget totale</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Importo Budget (€)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="1000.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="threshold">Soglia Alert (%)</Label>
              <Input
                id="threshold"
                type="number"
                min="1"
                max="100"
                placeholder="80"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Riceverai una notifica quando raggiungi questa percentuale
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Salva Budget</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
