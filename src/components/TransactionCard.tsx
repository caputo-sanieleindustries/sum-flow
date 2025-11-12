import { useState, useEffect } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Transaction, Category } from "@/hooks/useTransactions";
import { cn } from "@/lib/utils";
import { useTags, Tag } from "@/hooks/useTags";

interface TransactionCardProps {
  transaction: Transaction;
  category: Category | undefined;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionCard({ transaction, category, onEdit, onDelete }: TransactionCardProps) {
  const { getTransactionTags } = useTags();
  const [tags, setTags] = useState<Tag[]>([]);
  
  useEffect(() => {
    getTransactionTags(transaction.id).then(setTags);
  }, [transaction.id]);
  
  const isIncome = transaction.type === "income";
  const formattedDate = format(new Date(transaction.date), "d MMMM yyyy", { locale: it });
  const formattedAmount = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(transaction.amount);

  return (
    <Card className="p-4 transition-all hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full text-2xl",
              isIncome ? "bg-success/10" : "bg-warning/10"
            )}
          >
            {category?.icon || "📌"}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">{category?.name || "Altro"}</h3>
              <Badge
                variant={isIncome ? "default" : "destructive"}
                className={cn(
                  "text-xs",
                  isIncome && "bg-success hover:bg-success/90",
                  !isIncome && "bg-warning hover:bg-warning/90"
                )}
              >
                {isIncome ? "Entrata" : "Uscita"}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">{formattedDate}</p>
            
            {transaction.note && (
              <p className="text-sm text-muted-foreground italic line-clamp-2 mb-2">
                {transaction.note}
              </p>
            )}
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    style={{ backgroundColor: tag.color, color: "#fff" }}
                    className="text-xs"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <p
            className={cn(
              "text-xl font-bold",
              isIncome ? "text-success" : "text-warning"
            )}
          >
            {isIncome ? "+" : "-"}{formattedAmount}
          </p>
          
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(transaction)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(transaction.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
