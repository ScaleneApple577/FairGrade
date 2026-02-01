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

    const { project_id, student_id } = await req.json();

    console.log(`[calculate-scores] Calculating scores for project ${project_id}, student ${student_id}`);

    // Get all activities for this student in this project
    const { data: activities, error: activitiesError } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("project_id", project_id)
      .eq("student_id", student_id);

    if (activitiesError) {
      console.error("[calculate-scores] Error fetching activities:", activitiesError);
      return new Response(JSON.stringify({ error: "Failed to fetch activities" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all activities for the entire project (for group totals)
    const { data: groupActivities, error: groupError } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("project_id", project_id);

    if (groupError) {
      console.error("[calculate-scores] Error fetching group activities:", groupError);
      return new Response(JSON.stringify({ error: "Failed to fetch group activities" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate metrics for this student
    const studentCharsAdded = (activities || [])
      .filter((a) => a.activity_type === "document_edit")
      .reduce((sum, a) => sum + (a.characters_added || 0), 0);

    const studentMeetings = (activities || [])
      .filter((a) => a.activity_type === "meeting_join")
      .length;

    const studentMessages = (activities || [])
      .filter((a) => a.activity_type === "message_sent")
      .reduce((sum, a) => sum + ((a.metadata as any)?.message_count || 1), 0);

    // Calculate group totals
    const groupTotalChars = (groupActivities || [])
      .filter((a) => a.activity_type === "document_edit")
      .reduce((sum, a) => sum + (a.characters_added || 0), 0);

    const groupTotalMeetings = (groupActivities || [])
      .filter((a) => a.activity_type === "meeting_join")
      .length;

    const groupTotalMessages = (groupActivities || [])
      .filter((a) => a.activity_type === "message_sent")
      .reduce((sum, a) => sum + ((a.metadata as any)?.message_count || 1), 0);

    // Calculate percentage scores (avoiding division by zero)
    const documentScore = groupTotalChars > 0 
      ? (studentCharsAdded / groupTotalChars) * 100 
      : 0;
    
    const meetingScore = groupTotalMeetings > 0 
      ? (studentMeetings / groupTotalMeetings) * 100 
      : 0;
    
    const communicationScore = groupTotalMessages > 0 
      ? (studentMessages / groupTotalMessages) * 100 
      : 0;

    // Weighted total score: 50% document edits, 30% meetings, 20% communication
    const totalScore = (
      documentScore * 0.5 +
      meetingScore * 0.3 +
      communicationScore * 0.2
    );

    console.log(`[calculate-scores] Scores calculated: total=${totalScore.toFixed(2)}, doc=${documentScore.toFixed(2)}, meeting=${meetingScore.toFixed(2)}, comm=${communicationScore.toFixed(2)}`);

    // Upsert the contribution score
    const { error: upsertError } = await supabase
      .from("contribution_scores")
      .upsert(
        {
          project_id,
          student_id,
          total_score: Math.min(totalScore, 100),
          document_edit_score: Math.min(documentScore, 100),
          meeting_score: Math.min(meetingScore, 100),
          communication_score: Math.min(communicationScore, 100),
          last_calculated: new Date().toISOString(),
        },
        { onConflict: "project_id,student_id" }
      );

    if (upsertError) {
      console.error("[calculate-scores] Error upserting score:", upsertError);
      return new Response(JSON.stringify({ error: "Failed to save scores" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        scores: {
          total_score: Math.min(totalScore, 100),
          document_edit_score: Math.min(documentScore, 100),
          meeting_score: Math.min(meetingScore, 100),
          communication_score: Math.min(communicationScore, 100),
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[calculate-scores] Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
