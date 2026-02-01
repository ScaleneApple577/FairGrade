import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get auth token from header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the JWT and get user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[heartbeat] User ${user.id} heartbeat received`);

    // Update the extension_last_sync timestamp
    const { error: updateError } = await supabase
      .from("project_students")
      .update({ extension_last_sync: new Date().toISOString() })
      .eq("student_id", user.id);

    if (updateError) {
      console.error("[heartbeat] Error updating sync time:", updateError);
      // Don't fail the request, just log the error
    }

    // Get the student's active projects with their tracking URLs
    const { data: enrollments, error: enrollmentError } = await supabase
      .from("project_students")
      .select(`
        project_id,
        projects:project_id (
          id,
          name,
          status,
          project_urls (url, platform)
        )
      `)
      .eq("student_id", user.id);

    if (enrollmentError) {
      console.error("[heartbeat] Error fetching enrollments:", enrollmentError);
      return new Response(JSON.stringify({ error: "Failed to fetch projects" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Format response with active projects and their URLs
    const activeProjects = (enrollments || [])
      .filter((e: any) => e.projects?.status === "active")
      .map((e: any) => ({
        id: e.projects.id,
        name: e.projects.name,
        urls: e.projects.project_urls || [],
      }));

    console.log(`[heartbeat] Returning ${activeProjects.length} active projects for user ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        projects: activeProjects,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[heartbeat] Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
