import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyRequest {
  event: "created" | "updated" | "deleted";
  transaction: {
    id: string;
    amount: number;
    type: string;
    category_id: string | null;
    date: string;
    note: string | null;
  };
  user_email?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookUrl = Deno.env.get("N8N_WEBHOOK_TRANSACTION");
    
    if (!webhookUrl) {
      console.log("N8N_WEBHOOK_TRANSACTION not configured, skipping notification");
      return new Response(
        JSON.stringify({ message: "Webhook not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { event, transaction, user_email }: NotifyRequest = await req.json();

    // Get category details if category_id exists
    let categoryName = null;
    if (transaction.category_id) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: category } = await supabase
        .from("categories")
        .select("name")
        .eq("id", transaction.category_id)
        .single();

      categoryName = category?.name;
    }

    // Prepare webhook payload
    const payload = {
      event,
      timestamp: new Date().toISOString(),
      transaction: {
        ...transaction,
        category_name: categoryName,
      },
      user_email,
    };

    console.log("Sending webhook to n8n:", payload);

    // Send to n8n
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!webhookResponse.ok) {
      console.error("n8n webhook failed:", await webhookResponse.text());
    } else {
      console.log("n8n webhook sent successfully");
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in notify-n8n function:", error);
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
