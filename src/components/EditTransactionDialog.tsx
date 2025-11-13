import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Transaction, useTransactions } from "@/hooks/useTransactions";
import { TagSelector } from "@/components/TagSelector";
import { useTags } from "@/hooks/useTags";
import { ReceiptUpload } from "@/components/ReceiptUpload";
import { ReceiptList } from "@/components/ReceiptList";
import { useReceipts } from "@/hooks/useReceipts";

const transactionSchema = z.object({
  amount: z.string().min(1, "L'importo è obbligatorio").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "L'importo deve essere maggiore di zero"
  ),
  type: z.enum(["income", "expense"] as const),
  category_id: z.string().min(1, "Seleziona una categoria"),
  date: z.date(),
  note: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface EditTransactionDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTransactionDialog({
  transaction,
  open,
  onOpenChange,
}: EditTransactionDialogProps) {
  const { updateTransaction, categories, loading } = useTransactions();
  const { setTransactionTags } = useTags();
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [refreshReceipts, setRefreshReceipts] = useState(0);
  const { uploadReceipt, uploading } = useReceipts();

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: "",
      type: "income",
      category_id: "",
      date: new Date(),
      note: "",
    },
  });

  useEffect(() => {
    if (transaction && open) {
      form.reset({
        amount: transaction.amount.toString(),
        type: transaction.type,
        category_id: transaction.category_id || "",
        date: new Date(transaction.date),
        note: transaction.note || "",
      });
    }
  }, [transaction, open, form]);

  const onSubmit = async (data: TransactionFormValues) => {
    if (!transaction) return;

    try {
      await updateTransaction(transaction.id, {
        amount: parseFloat(data.amount),
        type: data.type,
        category_id: data.category_id,
        date: format(data.date, "yyyy-MM-dd"),
        note: data.note || null,
      });
      
      // Update tags
      await setTransactionTags(transaction.id, selectedTagIds);
      
      // Upload receipt if selected
      if (selectedFile) {
        await uploadReceipt(transaction.id, selectedFile);
        setRefreshReceipts(prev => prev + 1);
        setSelectedFile(null);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Errore nell'aggiornamento della transazione:", error);
    }
  };

  const selectedType = form.watch("type");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifica Transazione</DialogTitle>
          <DialogDescription>
            Modifica i dettagli della {selectedType === "income" ? "entrata" : "uscita"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona il tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">Entrata</SelectItem>
                      <SelectItem value="expense">Uscita</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Importo (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona una categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>Seleziona una data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nota (opzionale)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Aggiungi una nota..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Tag (opzionali)</FormLabel>
              <TagSelector
                selectedTagIds={selectedTagIds}
                onTagsChange={setSelectedTagIds}
                transactionId={transaction?.id}
              />
            </div>

            {transaction && (
              <ReceiptList 
                transactionId={transaction.id} 
                key={refreshReceipts}
                onReceiptsChange={() => setRefreshReceipts(prev => prev + 1)}
              />
            )}

            <div>
              <FormLabel>Aggiungi ricevuta</FormLabel>
              <ReceiptUpload
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
                onRemove={() => setSelectedFile(null)}
                uploading={uploading}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={loading || uploading}
                className={cn(
                  "flex-1",
                  selectedType === "income" && "bg-success hover:bg-success/90",
                  selectedType === "expense" && "bg-warning hover:bg-warning/90"
                )}
              >
                {loading ? "Salvataggio..." : "Salva Modifiche"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
