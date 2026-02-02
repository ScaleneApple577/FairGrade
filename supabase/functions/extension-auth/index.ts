import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create admin client for token verification
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { email, token } = await req.json();

    if (!email || !token) {
      return new Response(
        JSON.stringify({ error: "Email and token are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Extension auth attempt for email: ${email}`);

    // Find the user by email in profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("user_id, email, full_name")
      .eq("email", email)
      .single();

    if (profileError || !profile) {
      console.error("Profile not found:", profileError);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify the extension token
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from("extension_tokens")
      .select("*")
      .eq("student_id", profile.user_id)
      .eq("token", token)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (tokenError || !tokenData) {
      console.error("Token verification failed:", tokenError);
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Token verified for student: ${profile.user_id}`);

    // Get the student's enrolled projects
    const { data: enrollments, error: enrollmentError } = await supabaseAdmin
      .from("project_students")
      .select(`
        project_id,
        projects:project_id (
          id,
          name,
          course_name,
          status
        )
      `)
      .eq("student_id", profile.user_id);

    if (enrollmentError) {
      console.error("Error fetching projects:", enrollmentError);
    }

    // Get project URLs for tracking
    const projectIds = enrollments?.map((e) => e.project_id) || [];
    let projectUrls: any[] = [];
    
    if (projectIds.length > 0) {
      const { data: urls } = await supabaseAdmin
        .from("project_urls")
        .select("*")
        .in("project_id", projectIds);
      projectUrls = urls || [];
    }

    // Create a simple JWT-like auth token for the extension
    // In production, you'd use proper JWT signing
    const authPayload = {
      sub: profile.user_id,
      email: profile.email,
      name: profile.full_name,
      exp: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days
      iat: Math.floor(Date.now() / 1000),
    };

    // Encode as base64 (simple approach - in production use proper JWT)
    const authToken = btoa(JSON.stringify(authPayload));

    const projects = enrollments?.map((e) => ({
      ...e.projects,
      urls: projectUrls.filter((u) => u.project_id === e.project_id),
    })) || [];

    console.log(`Returning ${projects.length} projects for student`);

    return new Response(
      JSON.stringify({
        authToken,
        studentId: profile.user_id,
        studentName: profile.full_name,
        projects,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Extension auth error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
