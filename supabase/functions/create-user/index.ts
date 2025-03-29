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

    // Check if email already exists
    const { data: existingUser, error: existingUserError } =
      await supabaseClient
        .from("users")
        .select("email")
        .eq("email", email)
        .single();

    if (existingUser) {
      return new Response(
        JSON.stringify({
          error: "Email already in use",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create auth user
    const { data: authUser, error: authError } =
      await supabaseClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
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

    // Create user profile
    const { data: userProfile, error: profileError } = await supabaseClient
      .from("users")
      .insert({
        id: authUser.user.id,
        name,
        email,
        phone,
        role,
        password_hash: hashedPassword,
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
    console.error("Error in create-user function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
