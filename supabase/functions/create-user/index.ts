import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

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
    console.log("Create user function called");

    // Access environment variables from request headers
    // Supabase Edge Functions receive environment variables in the Authorization header
    const authHeader = req.headers.get("Authorization") || "";
    const supabaseUrl = authHeader.includes("SUPABASE_URL=")
      ? authHeader.split("SUPABASE_URL=")[1].split(" ")[0]
      : Deno.env.get("SUPABASE_URL");

    const supabaseServiceKey = authHeader.includes("SUPABASE_SERVICE_KEY=")
      ? authHeader.split("SUPABASE_SERVICE_KEY=")[1].split(" ")[0]
      : Deno.env.get("SUPABASE_SERVICE_KEY");

    console.log("Environment check:", {
      authHeaderExists: !!authHeader,
      authHeaderLength: authHeader.length,
      supabaseUrlExists: !!supabaseUrl,
      supabaseServiceKeyExists: !!supabaseServiceKey,
      supabaseUrlPartial: supabaseUrl
        ? supabaseUrl.substring(0, 10) + "..."
        : null,
      supabaseKeyPartial: supabaseServiceKey
        ? supabaseServiceKey.substring(0, 5) + "..."
        : null,
      envKeys: Object.keys(Deno.env.toObject()).filter((key) =>
        key.includes("SUPABASE"),
      ),
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase credentials:", {
        urlExists: !!supabaseUrl,
        keyExists: !!supabaseServiceKey,
      });
      return new Response(
        JSON.stringify({
          error:
            "Server configuration error: Supabase credentials not found. Please ensure SUPABASE_URL and SUPABASE_SERVICE_KEY are set in your environment.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const requestData = await req.json();
    const { id, name, email, phone, role, profile_image } = requestData;

    // Validate required fields
    if (!name || !email || !phone || !role) {
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

    // Check if user already exists (by phone number)
    const { data: existingUserByPhone, error: existingUserPhoneError } =
      await supabaseClient
        .from("users")
        .select("phone")
        .eq("phone", phone)
        .maybeSingle();

    if (existingUserByPhone) {
      // If user exists with this phone, just return the existing user
      const { data: existingUser, error: getUserError } = await supabaseClient
        .from("users")
        .select("*")
        .eq("phone", phone)
        .single();

      if (getUserError) {
        return new Response(JSON.stringify({ error: getUserError.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      return new Response(
        JSON.stringify({
          message: "User already exists",
          user: existingUser,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    // If we have an ID, this is a user created through OTP
    let userId = id;

    // If no ID is provided, we need to create a new user
    if (!userId) {
      // Create auth user with phone
      const { data: authUser, error: authError } =
        await supabaseClient.auth.admin.createUser({
          phone,
          email,
          email_confirm: true,
          phone_confirm: true,
          user_metadata: {
            name,
            role,
          },
        });

      if (authError) {
        return new Response(JSON.stringify({ error: authError.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      userId = authUser.user.id;
    }

    // Create user profile
    const { data: userProfile, error: profileError } = await supabaseClient
      .from("users")
      .insert({
        id: userId,
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
      // Rollback auth user creation if profile creation fails and we created a new user
      if (!id) {
        await supabaseClient.auth.admin.deleteUser(userId);
      }

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
          id: userId,
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
    console.error("Error in create-user function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
