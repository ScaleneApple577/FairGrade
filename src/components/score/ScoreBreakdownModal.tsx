import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  ChevronDown,
  ChevronUp,
  FileText,
  Users,
  Star,
  BarChart3,
  Shield,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { CircularScoreRing, getScoreLabel, getScoreColorClass } from "./CircularScoreRing";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface WorkOutputFactor {
  score: number | null;
  weight: 0.25;
  surviving_words: number;
  total_words_written: number;
  team_avg_surviving_words: number;
  content_score: number | null;
  meaningful_edits: number;
  team_avg_edits: number;
  edit_score: number | null;
  reasoning: string | null;
}

interface AttendanceFactor {
  score: number | null;
  weight: 0.30;
  meetings_attended: number;
  meetings_total: number;
  meeting_score: number | null;
  avg_response_time_hours: number;
  response_time_score: number | null;
  active_days: number;
  total_project_days: number;
  active_days_score: number | null;
  reasoning: string | null;
}

interface PeerRatingFactor {
  score: number | null;
  weight: 0.25;
  average_rating: number | null;
  review_count: number;
  min_reviews_required: 2;
  reasoning: string | null;
}

interface ConsistencyFactor {
  score: number | null;
  weight: 0.10;
  weekly_contributions: number[];
  coefficient_of_variation: number | null;
  reasoning: string | null;
}

interface IntegrityFactor {
  score: number | null;
  weight: 0.10;
  starting_score: 100;
  deductions: { reason: string; points: number; date: string }[];
  reasoning: string | null;
}

// Note: Integrity flags should be fetched from the analysis API:
// import { getStudentIntegrityFlags } from "@/lib/analysisUtils";
// const flags = await getStudentIntegrityFlags(projectId, studentId);
// The flags can then be mapped to the deductions format above

interface ScoreBreakdown {
  overall_score: number | null;
  factors: {
    work_output: WorkOutputFactor;
    attendance: AttendanceFactor;
    peer_rating: PeerRatingFactor;
    consistency: ConsistencyFactor;
    integrity: IntegrityFactor;
  };
  override?: {
    score: number;
    justification: string;
    overridden_by: string;
    overridden_at: string;
  } | null;
}

interface ScoreBreakdownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  studentAvatarColor?: string;
  projectId: string;
  projectName: string;
  isTeacher?: boolean;
}

export function ScoreBreakdownModal({
  open,
  onOpenChange,
  studentId,
  studentName,
  studentAvatar,
  studentAvatarColor = "bg-blue-500",
  projectId,
  projectName,
  isTeacher = false,
}: ScoreBreakdownModalProps) {
  const [breakdown, setBreakdown] = useState<ScoreBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedFactors, setExpandedFactors] = useState<string[]>([]);
  const [overrideScore, setOverrideScore] = useState("");
  const [overrideJustification, setOverrideJustification] = useState("");
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);

  useEffect(() => {
    if (open) {
      fetchBreakdown();
    }
  }, [open, studentId, projectId]);

  const fetchBreakdown = async () => {
    setIsLoading(true);
    try {
      // TODO: GET /api/scores/{student_id}/{project_id} for teachers
      // TODO: GET /api/student/scores/{project_id}/breakdown for students
      const endpoint = isTeacher
        ? `/api/scores/${studentId}/${projectId}`
        : `/api/student/scores/${projectId}/breakdown`;
      // const data = await api.get(endpoint);
      // setBreakdown(data);
      setBreakdown(null);
    } catch (error) {
      console.error("Failed to fetch score breakdown:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      // TODO: GET /api/reports/student-score/{student_id}/{project_id}/export
      toast.success("Report exported successfully");
    } catch (error) {
      toast.error("Failed to export report");
    }
  };

  const handleApplyOverride = async () => {
    if (!overrideScore || !overrideJustification) {
      toast.error("Please provide both a score and justification");
      return;
    }

    const score = parseInt(overrideScore);
    if (isNaN(score) || score < 0 || score > 100) {
      toast.error("Score must be between 0 and 100");
      return;
    }

    setIsSubmittingOverride(true);
    try {
      // TODO: POST /api/scores/{student_id}/{project_id}/override
      await api.post(`/api/scores/${studentId}/${projectId}/override`, {
        score,
        justification: overrideJustification,
      });
      toast.success("Score override applied");
      fetchBreakdown();
      setOverrideScore("");
      setOverrideJustification("");
    } catch (error) {
      toast.error("Failed to apply override");
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  const handleRemoveOverride = async () => {
    try {
      // TODO: DELETE /api/scores/{student_id}/{project_id}/override
      await api.delete(`/api/scores/${studentId}/${projectId}/override`);
      toast.success("Override removed");
      fetchBreakdown();
    } catch (error) {
      toast.error("Failed to remove override");
    }
  };

  const toggleFactor = (factor: string) => {
    setExpandedFactors((prev) =>
      prev.includes(factor)
        ? prev.filter((f) => f !== factor)
        : [...prev, factor]
    );
  };

  const scoreLabel = getScoreLabel(breakdown?.overall_score ?? null);
  const scoreColorClass = getScoreColorClass(breakdown?.overall_score ?? null);

  const workOutput = breakdown?.factors?.work_output;
  const attendance = breakdown?.factors?.attendance;
  const peerRating = breakdown?.factors?.peer_rating;
  const consistency = breakdown?.factors?.consistency;
  const integrity = breakdown?.factors?.integrity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111827] border border-white/10 rounded-2xl max-w-3xl mx-auto my-8 max-h-[85vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 bg-[#111827] border-b border-white/10 p-6 z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 ${studentAvatarColor} rounded-full flex items-center justify-center text-white font-bold text-2xl`}
              >
                {studentAvatar || studentName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{studentName}</h2>
                <p className="text-slate-400 text-sm">FairScore Breakdown</p>
                <span className="inline-block mt-1 bg-white/10 text-slate-300 text-xs px-2 py-0.5 rounded">
                  {projectName}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="bg-white/10 border-white/10 text-white hover:bg-white/15"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Skeleton className="w-32 h-32 rounded-full" />
              </div>
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <>
              {/* Overall Score */}
              <div className="flex flex-col items-center text-center py-6">
                <CircularScoreRing
                  score={breakdown?.overall_score ?? null}
                  size="xl"
                  animate={true}
                />
                <p className="text-slate-500 text-sm mt-2">/100</p>
                <p className={`mt-3 text-lg font-medium ${scoreColorClass}`}>
                  {scoreLabel.emoji} {scoreLabel.label}
                </p>

                {breakdown?.override && (
                  <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-2">
                    <p className="text-yellow-400 text-sm">
                      ⚠ Score overridden by teacher
                    </p>
                  </div>
                )}
              </div>

              {/* Factor Breakdown */}
              <div className="space-y-4">
                {/* Work Output */}
                <FactorCard
                  label="Work Output"
                  weight="25%"
                  score={workOutput?.score ?? null}
                  icon={FileText}
                  isExpanded={expandedFactors.includes("work_output")}
                  onToggle={() => toggleFactor("work_output")}
                >
                  <DetailRow
                    label="Surviving Words"
                    value={`${workOutput?.surviving_words ?? "—"} words survived out of ${workOutput?.total_words_written ?? "—"} written`}
                    subtext={`Team average: ${workOutput?.team_avg_surviving_words ?? "—"}`}
                    subscore={workOutput?.content_score}
                  />
                  <DetailRow
                    label="Meaningful Edits"
                    value={`${workOutput?.meaningful_edits ?? "—"} edits made`}
                    subtext={`Team average: ${workOutput?.team_avg_edits ?? "—"}`}
                    subscore={workOutput?.edit_score}
                  />
                  <ReasoningBlock reasoning={workOutput?.reasoning} />
                </FactorCard>

                {/* Attendance */}
                <FactorCard
                  label="Attendance"
                  weight="30%"
                  score={attendance?.score ?? null}
                  icon={Users}
                  isExpanded={expandedFactors.includes("attendance")}
                  onToggle={() => toggleFactor("attendance")}
                >
                  <DetailRow
                    label="Meeting Attendance"
                    value={`${attendance?.meetings_attended ?? "—"} of ${attendance?.meetings_total ?? "—"} meetings attended`}
                    subscore={attendance?.meeting_score}
                  />
                  <DetailRow
                    label="Avg Response Time"
                    value={`${attendance?.avg_response_time_hours ?? "—"} hours average`}
                    subscore={attendance?.response_time_score}
                  />
                  <DetailRow
                    label="Active Days"
                    value={`${attendance?.active_days ?? "—"} of ${attendance?.total_project_days ?? "—"} project days active`}
                    subscore={attendance?.active_days_score}
                  />
                  <ReasoningBlock reasoning={attendance?.reasoning} />
                </FactorCard>

                {/* Peer Rating */}
                <FactorCard
                  label="Peer Rating"
                  weight="25%"
                  score={peerRating?.score ?? null}
                  icon={Star}
                  isExpanded={expandedFactors.includes("peer_rating")}
                  onToggle={() => toggleFactor("peer_rating")}
                >
                  <DetailRow
                    label="Average Rating"
                    value={`${peerRating?.average_rating ?? "—"} / 5.0 from ${peerRating?.review_count ?? 0} reviews`}
                  />
                  {!isTeacher && (
                    <p className="text-slate-600 text-xs italic">
                      Individual reviewer identities are kept anonymous
                    </p>
                  )}
                  {(peerRating?.review_count ?? 0) < 2 && (
                    <p className="text-yellow-400 text-xs">
                      ⚠ Minimum 2 reviews required. Weight redistributed to other factors.
                    </p>
                  )}
                  <ReasoningBlock reasoning={peerRating?.reasoning} />
                </FactorCard>

                {/* Consistency */}
                <FactorCard
                  label="Consistency"
                  weight="10%"
                  score={consistency?.score ?? null}
                  icon={BarChart3}
                  isExpanded={expandedFactors.includes("consistency")}
                  onToggle={() => toggleFactor("consistency")}
                >
                  <div className="flex gap-1 h-12 items-end">
                    {(consistency?.weekly_contributions ?? []).length > 0 ? (
                      consistency?.weekly_contributions.map((count, i) => {
                        const max = Math.max(...(consistency?.weekly_contributions ?? [1]));
                        const height = max > 0 ? (count / max) * 100 : 0;
                        return (
                          <div
                            key={i}
                            className="flex-1 bg-blue-500 rounded-t"
                            style={{ height: `${height}%`, minHeight: "4px" }}
                            title={`Week ${i + 1}: ${count} contributions`}
                          />
                        );
                      })
                    ) : (
                      <p className="text-slate-500 text-xs">No weekly data available</p>
                    )}
                  </div>
                  <DetailRow
                    label="Coefficient of Variation"
                    value={consistency?.coefficient_of_variation?.toFixed(2) ?? "—"}
                    subtext="Lower is better (more consistent)"
                  />
                  <ReasoningBlock reasoning={consistency?.reasoning} />
                </FactorCard>

                {/* Integrity */}
                <FactorCard
                  label="Integrity"
                  weight="10%"
                  score={integrity?.score ?? null}
                  icon={Shield}
                  isExpanded={expandedFactors.includes("integrity")}
                  onToggle={() => toggleFactor("integrity")}
                >
                  <DetailRow label="Starting Score" value="100" />
                  {(integrity?.deductions ?? []).length > 0 ? (
                    <div className="space-y-2">
                      {integrity?.deductions.map((d, i) => (
                        <div key={i} className="flex items-center gap-2 text-red-400 text-sm">
                          <AlertTriangle className="w-4 h-4" />
                          <span>-{d.points} points: {d.reason} ({d.date})</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-400 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>No integrity issues detected</span>
                    </div>
                  )}
                  <ReasoningBlock reasoning={integrity?.reasoning} />
                </FactorCard>
              </div>

              {/* Score Calculation Summary */}
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-4">Score Calculation</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-500 text-xs uppercase">
                      <th className="text-left pb-2">Factor</th>
                      <th className="text-center pb-2">Score</th>
                      <th className="text-center pb-2">Weight</th>
                      <th className="text-right pb-2">Weighted</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    <CalcRow label="Work Output" score={workOutput?.score} weight={0.25} />
                    <CalcRow label="Attendance" score={attendance?.score} weight={0.30} />
                    <CalcRow label="Peer Rating" score={peerRating?.score} weight={0.25} />
                    <CalcRow label="Consistency" score={consistency?.score} weight={0.10} />
                    <CalcRow label="Integrity" score={integrity?.score} weight={0.10} />
                    <tr className="border-t border-white/10 font-bold text-white">
                      <td className="py-2">Total</td>
                      <td></td>
                      <td></td>
                      <td className="text-right py-2">
                        = {breakdown?.overall_score ?? "—"}/100
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Teacher Override Section */}
              {isTeacher && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-5">
                  <h3 className="text-white font-semibold mb-2">Teacher Override</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    You can override the calculated FairScore with your own assessment. You must provide a justification.
                  </p>

                  {breakdown?.override ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 line-through">
                          Original: {breakdown.overall_score}
                        </span>
                        <span className="text-yellow-400 font-bold">
                          Override: {breakdown.override.score}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm italic">
                        "{breakdown.override.justification}"
                      </p>
                      <button
                        onClick={handleRemoveOverride}
                        className="text-red-400 text-xs hover:text-red-300"
                      >
                        Remove Override
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="Score"
                          value={overrideScore}
                          onChange={(e) => setOverrideScore(e.target.value)}
                          className="w-24 bg-white/10 border-white/10 text-white text-center"
                        />
                        <span className="text-slate-400 self-center">/100</span>
                      </div>
                      <Textarea
                        placeholder="Explain why you're overriding the calculated score..."
                        value={overrideJustification}
                        onChange={(e) => setOverrideJustification(e.target.value)}
                        className="bg-white/10 border-white/10 text-white min-h-[80px] placeholder:text-slate-500"
                      />
                      <Button
                        onClick={handleApplyOverride}
                        disabled={!overrideScore || !overrideJustification || isSubmittingOverride}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black"
                      >
                        {isSubmittingOverride ? "Applying..." : "Apply Override"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FactorCard({
  label,
  weight,
  score,
  icon: Icon,
  isExpanded,
  onToggle,
  children,
}: {
  label: string;
  weight: string;
  score: number | null;
  icon: React.ElementType;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-center justify-between hover:bg-white/[0.02] transition"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-slate-400" />
          <span className="text-white font-semibold">{label}</span>
          <span className="text-slate-500 text-sm">{weight}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`font-bold ${getScoreColorClass(score)}`}>
            {score !== null ? `${score}/100` : "—/100"}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      <div className="px-5 pb-2">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              score !== null
                ? score >= 80
                  ? "bg-emerald-500"
                  : score >= 60
                  ? "bg-blue-500"
                  : score >= 40
                  ? "bg-yellow-500"
                  : "bg-red-500"
                : "bg-slate-600"
            }`}
            style={{ width: `${score ?? 0}%` }}
          />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-3 border-t border-white/5 space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailRow({
  label,
  value,
  subtext,
  subscore,
}: {
  label: string;
  value: string;
  subtext?: string;
  subscore?: number | null;
}) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-slate-400 text-sm">{label}</p>
        <p className="text-slate-300 text-sm">{value}</p>
        {subtext && <p className="text-slate-500 text-xs">{subtext}</p>}
      </div>
      {subscore !== undefined && (
        <span className={`text-sm font-medium ${getScoreColorClass(subscore ?? null)}`}>
          {subscore ?? "—"}/100
        </span>
      )}
    </div>
  );
}

function ReasoningBlock({ reasoning }: { reasoning: string | null | undefined }) {
  return (
    <div className="bg-white/[0.02] rounded-lg p-3 mt-3">
      <p className="text-slate-400 text-xs font-medium mb-1">📝 Reasoning:</p>
      <p className="text-slate-500 text-xs">
        {reasoning ?? "Reasoning will be generated when score data is available"}
      </p>
    </div>
  );
}

function CalcRow({ label, score, weight }: { label: string; score?: number | null; weight: number }) {
  const weighted = score !== null && score !== undefined ? (score * weight).toFixed(1) : "—";
  return (
    <tr className="border-t border-white/5">
      <td className="py-2">{label}</td>
      <td className="text-center py-2">{score ?? "—"}/100</td>
      <td className="text-center py-2">× {weight}</td>
      <td className="text-right py-2">= {weighted}</td>
    </tr>
  );
}
