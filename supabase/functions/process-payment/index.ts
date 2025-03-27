import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    // Get the session of the logged-in user
    const {
      data: { session },
      error: sessionError,
    } = await supabaseClient.auth.getSession();

    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const { appointment_id, amount, payment_method } = await req.json();

    // Validate required fields
    if (!appointment_id || !amount || !payment_method) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Validate that the appointment exists and belongs to the user
    const { data: appointment, error: appointmentError } = await supabaseClient
      .from("appointments")
      .select("id, customer_id, payment_status")
      .eq("id", appointment_id)
      .single();

    if (appointmentError || !appointment) {
      return new Response(JSON.stringify({ error: "Appointment not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Check if the appointment belongs to the user
    if (appointment.customer_id !== session.user.id) {
      return new Response(
        JSON.stringify({
          error: "You do not have permission to pay for this appointment",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        },
      );
    }

    // Check if the appointment is already paid
    if (appointment.payment_status === "paid") {
      return new Response(
        JSON.stringify({ error: "This appointment is already paid" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // In a real application, you would integrate with a payment gateway here
    // For this example, we'll simulate a successful payment
    const transaction_status = "success"; // In real app, this would come from payment gateway

    // Record the payment
    const { data: payment, error: paymentError } = await supabaseClient
      .from("payments")
      .insert({
        appointment_id,
        customer_id: session.user.id,
        amount,
        payment_method,
        transaction_status,
      })
      .select()
      .single();

    if (paymentError) {
      return new Response(JSON.stringify({ error: paymentError.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    return new Response(
      JSON.stringify({
        message: "Payment processed successfully",
        payment,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
