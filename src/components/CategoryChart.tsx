import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";
import { Transaction, Category } from "@/hooks/useTransactions";

interface CategoryChartProps {
  transactions: Transaction[];
  categories: Category[];
}

export function CategoryChart({ transactions, categories }: CategoryChartProps) {
  const chartData = useMemo(() => {
    const expensesByCategory = new Map<string, number>();

    // Calculate expenses by category
    transactions
      .filter((t) => t.type === "expense")
      .forEach((transaction) => {
        const categoryId = transaction.category_id || "other";
        const currentAmount = expensesByCategory.get(categoryId) || 0;
        expensesByCategory.set(categoryId, currentAmount + parseFloat(transaction.amount.toString()));
      });

    // Convert to array with category info
    const data = Array.from(expensesByCategory.entries())
      .map(([categoryId, amount]) => {
        const category = categories.find((c) => c.id === categoryId);
        return {
          name: category?.name || "Altro",
          value: Math.round(amount * 100) / 100,
          icon: category?.icon || "📌",
          color: category?.color || "hsl(0, 0%, 85%)",
        };
      })
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    return data;
  }, [transactions, categories]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const formatPercent = (value: number, total: number) => {
    const percent = (value / total) * 100;
    return `${percent.toFixed(1)}%`;
  };

  const total = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <Card className="bg-card p-6 shadow-card">
        <h3 className="mb-4 text-lg font-semibold">Spese per Categoria</h3>
        <div className="flex h-64 items-center justify-center rounded-lg bg-muted/30">
          <p className="text-sm text-muted-foreground">Nessuna spesa da visualizzare</p>
        </div>
      </Card>
    );
  }

  const renderCustomLabel = (entry: any) => {
    const percent = ((entry.value / total) * 100).toFixed(0);
    return `${percent}%`;
  };

  return (
    <Card className="bg-card p-6 shadow-card">
      <h3 className="mb-4 text-lg font-semibold">Spese per Categoria</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
            }}
            formatter={(value: number) => formatCurrency(value)}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Category Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {chartData.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="h-3 w-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="flex-1 truncate">
              {entry.icon} {entry.name}
            </span>
            <span className="font-medium text-muted-foreground">
              {formatPercent(entry.value, total)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
