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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    const { name, email, password, phone, role, profile_image } =
      await req.json();

    // Validate required fields
    if (!name || !email || !password || !role) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Validate role
    if (!["customer", "barber", "admin"].includes(role)) {
      return new Response(
        JSON.stringify({
          error: "Invalid role. Must be customer, barber, or admin",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Create auth user
    const { data: authUser, error: authError } =
      await supabaseClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Create user profile
    const { data: userProfile, error: profileError } = await supabaseClient
      .from("users")
      .insert({
        id: authUser.user.id,
        name,
        email,
        phone,
        role,
        profile_image:
          profile_image ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.toLowerCase().replace(/\s+/g, "")}`,
      })
      .select()
      .single();

    if (profileError) {
      // Rollback auth user creation if profile creation fails
      await supabaseClient.auth.admin.deleteUser(authUser.user.id);

      return new Response(JSON.stringify({ error: profileError.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // If user is a barber, create barber profile
    if (role === "barber") {
      const { error: barberError } = await supabaseClient
        .from("barber_details")
        .insert({
          id: authUser.user.id,
          specialty: "Haircuts",
          experience: 1,
          rating: 4.5,
          location: "Main Street Shop",
          availability_status: true,
        });

      if (barberError) {
        console.error("Error creating barber details:", barberError);
      }
    }

    return new Response(
      JSON.stringify({
        message: "User created successfully",
        user: userProfile,
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
