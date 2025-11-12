import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookUrl = Deno.env.get("N8N_WEBHOOK_DAILY_REPORT");
    
    if (!webhookUrl) {
      console.log("N8N_WEBHOOK_DAILY_REPORT not configured, skipping report");
      return new Response(
        JSON.stringify({ message: "Webhook not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get yesterday's date range
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    console.log("Generating daily report for:", yesterdayStr);

    // Fetch transactions for yesterday
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select(`
        *,
        categories (name)
      `)
      .eq("date", yesterdayStr);

    if (error) {
      throw error;
    }

    // Calculate totals
    const totalIncome = transactions
      ?.filter(t => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    const totalExpenses = transactions
      ?.filter(t => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    const netBalance = totalIncome - totalExpenses;

    // Group by category
    const byCategory = transactions?.reduce((acc: any, t) => {
      const categoryName = t.categories?.name || "Senza categoria";
      if (!acc[categoryName]) {
        acc[categoryName] = { income: 0, expense: 0, count: 0 };
      }
      if (t.type === "income") {
        acc[categoryName].income += Number(t.amount);
      } else {
        acc[categoryName].expense += Number(t.amount);
      }
      acc[categoryName].count++;
      return acc;
    }, {});

    // Prepare report payload
    const payload = {
      date: yesterdayStr,
      timestamp: new Date().toISOString(),
      summary: {
        total_income: totalIncome,
        total_expenses: totalExpenses,
        net_balance: netBalance,
        transaction_count: transactions?.length || 0,
      },
      by_category: byCategory,
      transactions: transactions || [],
    };

    console.log("Sending daily report to n8n");

    // Send to n8n
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!webhookResponse.ok) {
      console.error("n8n daily report webhook failed:", await webhookResponse.text());
    } else {
      console.log("n8n daily report sent successfully");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        report: {
          date: yesterdayStr,
          transaction_count: transactions?.length || 0,
          total_income: totalIncome,
          total_expenses: totalExpenses,
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in daily-report function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
