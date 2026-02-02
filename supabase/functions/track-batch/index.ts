import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ActivityEvent {
  event_type: string;
  url?: string;
  platform?: string;
  project_id?: string;
  duration_seconds?: number;
  characters_added?: number;
  characters_deleted?: number;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Decode and verify the auth token
    let payload: { sub: string; exp: number };
    try {
      payload = JSON.parse(atob(token));
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid token format" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check token expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return new Response(
        JSON.stringify({ error: "Token expired" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const studentId = payload.sub;
    console.log(`Track-batch request from student: ${studentId}`);

    // Parse request body
    const { events } = await req.json() as { events: ActivityEvent[] };

    if (!events || !Array.isArray(events) || events.length === 0) {
      return new Response(
        JSON.stringify({ error: "Events array is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Processing ${events.length} events`);

    // Validate and prepare events for insertion
    const validEvents = events
      .filter((event) => event.event_type)
      .map((event) => ({
        student_id: studentId,
        project_id: event.project_id || null,
        event_type: event.event_type,
        url: event.url || null,
        platform: event.platform || null,
        duration_seconds: event.duration_seconds || 0,
        characters_added: event.characters_added || 0,
        characters_deleted: event.characters_deleted || 0,
        metadata: event.metadata || {},
        timestamp: event.timestamp || new Date().toISOString(),
      }));

    if (validEvents.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid events provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Insert events into event_stream table
    const { data, error } = await supabaseAdmin
      .from("event_stream")
      .insert(validEvents)
      .select("id");

    if (error) {
      console.error("Error inserting events:", error);
      return new Response(
        JSON.stringify({ error: "Failed to save events", details: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Successfully saved ${data.length} events`);

    return new Response(
      JSON.stringify({
        success: true,
        events_saved: data.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Track-batch error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
