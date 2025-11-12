import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { format, startOfYear, eachMonthOfInterval, endOfYear } from "date-fns";
import { it } from "date-fns/locale";

export function AdvancedStats() {
  const { transactions } = useTransactions();

  const yearlyData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearStart = startOfYear(new Date(currentYear, 0, 1));
    const yearEnd = endOfYear(new Date(currentYear, 11, 31));
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    return months.map((month) => {
      const monthStr = format(month, "yyyy-MM");
      const monthTransactions = transactions.filter((t) =>
        t.date.startsWith(monthStr)
      );

      const income = monthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

      const expenses = monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

      return {
        month: format(month, "MMM", { locale: it }),
        income,
        expenses,
        net: income - expenses,
      };
    });
  }, [transactions]);

  const monthlyComparison = useMemo(() => {
    const last6Months = yearlyData.slice(-6);
    return last6Months.map((data, index) => ({
      ...data,
      trend: index > 0 ? data.expenses - last6Months[index - 1].expenses : 0,
    }));
  }, [yearlyData]);

  const forecast = useMemo(() => {
    const last3Months = yearlyData.slice(-3);
    const avgExpenses =
      last3Months.reduce((sum, m) => sum + m.expenses, 0) / last3Months.length;
    const avgIncome =
      last3Months.reduce((sum, m) => sum + m.income, 0) / last3Months.length;

    const trend = last3Months.length >= 2
      ? (last3Months[last3Months.length - 1].expenses - last3Months[0].expenses) /
        last3Months.length
      : 0;

    const nextMonthExpenses = avgExpenses + trend;
    const nextMonthIncome = avgIncome;

    return {
      avgExpenses,
      avgIncome,
      trend,
      nextMonthExpenses,
      nextMonthIncome,
      savingsRate: avgIncome > 0 ? ((avgIncome - avgExpenses) / avgIncome) * 100 : 0,
    };
  }, [yearlyData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-2xl font-bold text-foreground">Statistiche Avanzate</h2>
      </div>

      {/* Forecast Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border bg-card p-4 shadow-card">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Previsione Prossimo Mese</p>
            <p className="text-2xl font-bold text-expense">
              {formatCurrency(forecast.nextMonthExpenses)}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {forecast.trend > 0 ? (
                <TrendingUp className="h-3 w-3 text-expense" />
              ) : (
                <TrendingDown className="h-3 w-3 text-income" />
              )}
              <span>
                {forecast.trend > 0 ? "+" : ""}
                {formatCurrency(forecast.trend)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="border bg-card p-4 shadow-card">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Media Mensile Spese</p>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(forecast.avgExpenses)}
            </p>
            <p className="text-xs text-muted-foreground">Ultimi 3 mesi</p>
          </div>
        </Card>

        <Card className="border bg-card p-4 shadow-card">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Tasso di Risparmio</p>
            <p className="text-2xl font-bold text-income">
              {forecast.savingsRate.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(forecast.avgIncome - forecast.avgExpenses)}/mese
            </p>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="yearly" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="yearly">Andamento Annuale</TabsTrigger>
          <TabsTrigger value="comparison">Confronto Mensile</TabsTrigger>
          <TabsTrigger value="trends">Trend</TabsTrigger>
        </TabsList>

        <TabsContent value="yearly" className="mt-4">
          <Card className="border bg-card p-6 shadow-card">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Entrate vs Uscite {new Date().getFullYear()}
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => `€${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Bar
                  dataKey="income"
                  name="Entrate"
                  fill="hsl(var(--income))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expenses"
                  name="Uscite"
                  fill="hsl(var(--expense))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="mt-4">
          <Card className="border bg-card p-6 shadow-card">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Ultimi 6 Mesi - Confronto Spese
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => `€${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="Spese"
                  stroke="hsl(var(--expense))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="Entrate"
                  stroke="hsl(var(--income))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {monthlyComparison.slice(-3).map((month, index) => (
                <div
                  key={month.month}
                  className="rounded-lg border bg-muted/50 p-4"
                >
                  <p className="text-sm font-medium text-foreground">{month.month}</p>
                  <p className="mt-1 text-xl font-bold text-expense">
                    {formatCurrency(month.expenses)}
                  </p>
                  {index > 0 && (
                    <div className="mt-1 flex items-center gap-1 text-xs">
                      {month.trend > 0 ? (
                        <>
                          <TrendingUp className="h-3 w-3 text-expense" />
                          <span className="text-expense">
                            +{formatCurrency(Math.abs(month.trend))}
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-3 w-3 text-income" />
                          <span className="text-income">
                            {formatCurrency(month.trend)}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="mt-4">
          <Card className="border bg-card p-6 shadow-card">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Saldo Netto - Trend Annuale
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={yearlyData}>
                <defs>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => `€${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Area
                  type="monotone"
                  dataKey="net"
                  name="Saldo Netto"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorNet)"
                />
              </AreaChart>
            </ResponsiveContainer>

            <div className="mt-6 rounded-lg border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                Analisi Trend: Il saldo netto medio annuale è di{" "}
                <span className="font-semibold text-foreground">
                  {formatCurrency(
                    yearlyData.reduce((sum, m) => sum + m.net, 0) / 12
                  )}
                </span>
                . Con il trend attuale, la previsione per il prossimo mese è un saldo
                di{" "}
                <span className="font-semibold text-foreground">
                  {formatCurrency(
                    forecast.nextMonthIncome - forecast.nextMonthExpenses
                  )}
                </span>
                .
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
