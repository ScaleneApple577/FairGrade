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

    console.log(`[student-stats] Fetching stats for user ${user.id} in project ${project_id}`);

    // Get contribution score
    const { data: score, error: scoreError } = await supabase
      .from("contribution_scores")
      .select("*")
      .eq("project_id", project_id)
      .eq("student_id", user.id)
      .single();

    if (scoreError && scoreError.code !== "PGRST116") {
      console.error("[student-stats] Error fetching score:", scoreError);
    }

    // Get recent activity count
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: recentActivities, error: activityError } = await supabase
      .from("activity_logs")
      .select("activity_type, duration_seconds, timestamp")
      .eq("project_id", project_id)
      .eq("student_id", user.id)
      .gte("timestamp", oneWeekAgo.toISOString());

    if (activityError) {
      console.error("[student-stats] Error fetching activities:", activityError);
    }

    // Calculate hours this week
    const totalSeconds = (recentActivities || []).reduce(
      (sum, a) => sum + (a.duration_seconds || 0),
      0
    );
    const hoursThisWeek = (totalSeconds / 3600).toFixed(1);

    // Get tasks assigned to user from Supabase project_tasks table
    // NOTE: Supabase table uses: { task_name, completed, assigned_to }
    // Backend API uses: { title, status, assigned_to }
    // When migrating to backend API: 
    //   - Replace 'task_name' with 'title'
    //   - Replace 'completed' boolean with 'status' enum ('open', 'in_progress', 'done')
    const { data: tasks, error: tasksError } = await supabase
      .from("project_tasks")
      .select("*")
      .eq("project_id", project_id)
      .eq("assigned_to", user.id);

    if (tasksError) {
      console.error("[student-stats] Error fetching tasks:", tasksError);
    }

    // Supabase uses 'completed' boolean; backend API uses status === 'done'
    const completedTasks = (tasks || []).filter((t) => t.completed).length;
    const totalTasks = (tasks || []).length;

    return new Response(
      JSON.stringify({
        contribution_score: score || {
          total_score: 0,
          document_edit_score: 0,
          meeting_score: 0,
          communication_score: 0,
        },
        hours_this_week: hoursThisWeek,
        activities_count: (recentActivities || []).length,
        tasks: {
          completed: completedTasks,
          total: totalTasks,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[student-stats] Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
