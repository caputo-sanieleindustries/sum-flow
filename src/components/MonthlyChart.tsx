import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { Transaction } from "@/hooks/useTransactions";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface MonthlyChartProps {
  transactions: Transaction[];
}

export function MonthlyChart({ transactions }: MonthlyChartProps) {
  const chartData = useMemo(() => {
    const monthlyData = new Map<string, { income: number; expense: number }>();

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthKey = format(date, "MMM yyyy", { locale: it });

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { income: 0, expense: 0 });
      }

      const data = monthlyData.get(monthKey)!;
      if (transaction.type === "income") {
        data.income += parseFloat(transaction.amount.toString());
      } else {
        data.expense += parseFloat(transaction.amount.toString());
      }
    });

    // Convert to array and sort by date
    const sortedData = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        entrate: Math.round(data.income * 100) / 100,
        uscite: Math.round(data.expense * 100) / 100,
      }))
      .slice(-6); // Last 6 months

    return sortedData;
  }, [transactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (chartData.length === 0) {
    return (
      <Card className="bg-card p-6 shadow-card">
        <h3 className="mb-4 text-lg font-semibold">Andamento Mensile</h3>
        <div className="flex h-64 items-center justify-center rounded-lg bg-muted/30">
          <p className="text-sm text-muted-foreground">Nessun dato disponibile</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-card p-6 shadow-card">
      <h3 className="mb-4 text-lg font-semibold">Andamento Mensile</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="month"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickFormatter={formatCurrency}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
            }}
            formatter={(value: number) => formatCurrency(value)}
            labelStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
            }}
          />
          <Bar
            dataKey="entrate"
            fill="hsl(var(--success))"
            radius={[8, 8, 0, 0]}
            name="Entrate"
          />
          <Bar
            dataKey="uscite"
            fill="hsl(var(--warning))"
            radius={[8, 8, 0, 0]}
            name="Uscite"
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
