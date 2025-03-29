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

    const { barber_id, service_type, appointment_time } = await req.json();

    // Validate required fields
    if (!barber_id || !service_type || !appointment_time) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Validate that the barber exists
    const { data: barber, error: barberError } = await supabaseClient
      .from("users")
      .select("id, role")
      .eq("id", barber_id)
      .eq("role", "barber")
      .single();

    if (barberError || !barber) {
      return new Response(JSON.stringify({ error: "Barber not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Check if barber is available
    const { data: barberDetails, error: detailsError } = await supabaseClient
      .from("barber_details")
      .select("availability_status")
      .eq("id", barber_id)
      .single();

    if (detailsError) {
      return new Response(
        JSON.stringify({ error: "Error checking barber availability" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    if (barberDetails && !barberDetails.availability_status) {
      return new Response(
        JSON.stringify({ error: "Barber is not available for bookings" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Parse appointment time
    let appointmentDateTime;
    try {
      appointmentDateTime = new Date(appointment_time);
      if (isNaN(appointmentDateTime.getTime())) {
        throw new Error("Invalid date format");
      }
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Invalid appointment time format" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = appointmentDateTime.getDay();

    // Check if barber is available on this day
    const { data: barberAvailability, error: availabilityError } =
      await supabaseClient
        .from("barber_availability")
        .select("*")
        .eq("barber_id", barber_id)
        .eq("day_of_week", dayOfWeek);

    if (availabilityError) {
      return new Response(
        JSON.stringify({ error: "Error checking barber availability" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    if (!barberAvailability || barberAvailability.length === 0) {
      return new Response(
        JSON.stringify({ error: "Barber is not available on this day" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Check if appointment time is within barber's available hours
    const availability = barberAvailability[0];
    const appointmentHours = appointmentDateTime.getHours();
    const appointmentMinutes = appointmentDateTime.getMinutes();
    const appointmentTimeString = `${appointmentHours.toString().padStart(2, "0")}:${appointmentMinutes.toString().padStart(2, "0")}`;

    const startTime = availability.start_time;
    const endTime = availability.end_time;

    if (appointmentTimeString < startTime || appointmentTimeString >= endTime) {
      return new Response(
        JSON.stringify({
          error: "Appointment time is outside barber's available hours",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Check for conflicting appointments
    const startTimeDate = new Date(appointmentDateTime.getTime() - 30 * 60000); // 30 minutes before
    const endTimeDate = new Date(appointmentDateTime.getTime() + 60 * 60000); // 60 minutes after

    const { data: conflictingAppointments, error: conflictError } =
      await supabaseClient
        .from("appointments")
        .select("id")
        .eq("barber_id", barber_id)
        .gte("appointment_time", startTimeDate.toISOString())
        .lte("appointment_time", endTimeDate.toISOString())
        .neq("status", "cancelled");

    if (conflictError) {
      return new Response(
        JSON.stringify({ error: "Error checking appointment availability" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    if (conflictingAppointments && conflictingAppointments.length > 0) {
      return new Response(
        JSON.stringify({ error: "This time slot is already booked" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 409,
        },
      );
    }

    // Create the appointment
    const { data: appointment, error: appointmentError } = await supabaseClient
      .from("appointments")
      .insert({
        customer_id: session.user.id,
        barber_id,
        service_type,
        appointment_time: appointmentDateTime.toISOString(),
        status: "pending",
      })
      .select()
      .single();

    if (appointmentError) {
      return new Response(JSON.stringify({ error: appointmentError.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    return new Response(
      JSON.stringify({
        message: "Appointment booked successfully",
        appointment,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201,
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
