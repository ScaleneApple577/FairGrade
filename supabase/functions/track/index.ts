import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  // Handle CORS preflight
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

    const { 
      project_id, 
      activity_type, 
      platform, 
      url, 
      duration_seconds, 
      characters_added, 
      characters_deleted, 
      metadata 
    } = await req.json();

    console.log(`[track] User ${user.id} activity: ${activity_type} on ${platform}`);

    // Validate that the URL is in the allowed project URLs
    const { data: allowedUrls, error: urlError } = await supabase
      .from("project_urls")
      .select("url, platform")
      .eq("project_id", project_id);

    if (urlError) {
      console.error("[track] Error fetching project URLs:", urlError);
      return new Response(JSON.stringify({ error: "Failed to validate URL" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if the URL matches any allowed URLs
    const isAllowed = allowedUrls?.some((allowed) => {
      return url.includes(new URL(allowed.url).hostname);
    });

    if (!isAllowed) {
      console.log(`[track] URL not in project scope: ${url}`);
      return new Response(
        JSON.stringify({ error: "URL not in project tracking scope" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Insert activity log
    const { error: insertError } = await supabase.from("activity_logs").insert({
      project_id,
      student_id: user.id,
      activity_type,
      platform,
      url,
      duration_seconds: duration_seconds || 0,
      characters_added: characters_added || 0,
      characters_deleted: characters_deleted || 0,
      metadata: metadata || {},
    });

    if (insertError) {
      console.error("[track] Error inserting activity:", insertError);
      return new Response(JSON.stringify({ error: "Failed to log activity" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[track] Activity logged successfully for user ${user.id}`);

    // Trigger score recalculation (async, fire and forget)
    supabase.functions.invoke("calculate-scores", {
      body: { project_id, student_id: user.id },
    });

    return new Response(
      JSON.stringify({ success: true, message: "Activity logged" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[track] Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
