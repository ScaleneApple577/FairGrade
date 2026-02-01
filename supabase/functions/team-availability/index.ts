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

    // Get project_id from query params
    const url = new URL(req.url);
    const project_id = url.searchParams.get("project_id");

    if (!project_id) {
      return new Response(JSON.stringify({ error: "project_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[team-availability] Fetching availability for project ${project_id}`);

    // Verify user is in this project
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("project_students")
      .select("group_id")
      .eq("project_id", project_id)
      .eq("student_id", user.id)
      .single();

    if (enrollmentError || !enrollment) {
      return new Response(JSON.stringify({ error: "Not enrolled in this project" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all teammates in the same group
    const { data: teammates, error: teammatesError } = await supabase
      .from("project_students")
      .select("student_id, profiles:student_id (full_name)")
      .eq("project_id", project_id)
      .eq("group_id", enrollment.group_id);

    if (teammatesError) {
      console.error("[team-availability] Error fetching teammates:", teammatesError);
    }

    const teammateIds = (teammates || []).map((t: any) => t.student_id);

    // Get availability for all teammates
    const { data: availability, error: availabilityError } = await supabase
      .from("student_availability")
      .select("*")
      .eq("project_id", project_id)
      .in("student_id", teammateIds);

    if (availabilityError) {
      console.error("[team-availability] Error fetching availability:", availabilityError);
    }

    // Transform into a grid format
    const days = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 8 PM

    const grid: Record<string, Record<string, number>> = {};

    hours.forEach((hour) => {
      const timeKey = `${hour}:00`;
      grid[timeKey] = {};
      days.forEach((day) => {
        // Count how many teammates are available at this time
        const availableCount = (availability || []).filter(
          (a: any) =>
            a.day_of_week === day &&
            parseInt(a.start_time.split(":")[0]) <= hour &&
            parseInt(a.end_time.split(":")[0]) > hour
        ).length;
        grid[timeKey][day.toString()] = availableCount;
      });
    });

    return new Response(
      JSON.stringify({
        total_members: teammateIds.length,
        availability_grid: grid,
        teammates: teammates?.map((t: any) => ({
          id: t.student_id,
          name: t.profiles?.full_name || "Unknown",
        })),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[team-availability] Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
