import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BudgetAlertRequest {
  budget_id: string;
  user_email: string;
  category_id: string | null;
  amount: number;
  spent: number;
  percentage: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_email, category_id, amount, spent, percentage }: BudgetAlertRequest = await req.json();

    console.log("Sending budget alert to:", user_email);

    const categoryText = category_id ? "per la categoria selezionata" : "totale mensile";
    
    const emailResponse = await resend.emails.send({
      from: "Budget Manager <onboarding@resend.dev>",
      to: [user_email],
      subject: `⚠️ Alert Budget: ${percentage}% raggiunto`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ef4444;">🚨 Alert Budget</h1>
          <p>Ciao,</p>
          <p>Ti informiamo che hai raggiunto il <strong>${percentage}%</strong> del tuo budget ${categoryText}.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #1f2937;">Dettagli Budget</h2>
            <p style="margin: 10px 0;"><strong>Budget impostato:</strong> ${new Intl.NumberFormat("it-IT", {
              style: "currency",
              currency: "EUR",
            }).format(amount)}</p>
            <p style="margin: 10px 0;"><strong>Speso finora:</strong> ${new Intl.NumberFormat("it-IT", {
              style: "currency",
              currency: "EUR",
            }).format(spent)}</p>
            <p style="margin: 10px 0;"><strong>Percentuale:</strong> ${percentage}%</p>
          </div>
          
          <p>Ti consigliamo di monitorare attentamente le tue spese per non superare il budget previsto.</p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Questo è un messaggio automatico da Budget Manager.<br>
            Accedi all'app per gestire i tuoi budget.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in budget-alert function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
