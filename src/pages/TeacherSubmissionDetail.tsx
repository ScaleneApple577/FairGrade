import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader2, ArrowLeft, ExternalLink, Play, Pause, AlertTriangle,
  Flag, FileText, ChevronLeft, ChevronRight, SkipBack, SkipForward, Rewind, FastForward, RefreshCw,
  Eye, MessageSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GoogleDocsToolbar } from "@/components/docs/GoogleDocsToolbar";
import {
  getMonitoringDetail, getReplayData, getFlags, updateFlag, getReport,
  pauseMonitoring, resumeMonitoring, forcePoll, triggerAnalysis,
  getMonitoringStateColor, getSeverityColor, getHighlightRangesFromFlag,
  reconstructAtPosition, extractTextFromDocJson,
  type MonitoringDetail, type ReplayData, type Flag as FlagType, type Report, type ReconstructedContent,
  type HighlightRange,
} from "@/lib/monitoringUtils";
import DocsRenderer from "@/components/docs/DocsRenderer";

export default function TeacherSubmissionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [detail, setDetail] = useState<MonitoringDetail | null>(null);
  const [replay, setReplay] = useState<ReplayData | null>(null);
  const [flags, setFlags] = useState<FlagType[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timelinePosition, setTimelinePosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeTab, setActiveTab] = useState<"replay" | "flags" | "report">("replay");
  const [selectedFlag, setSelectedFlag] = useState<FlagType | null>(null);
  const [sidePanelTab, setSidePanelTab] = useState<"insights" | "notes">("insights");

  useEffect(() => {
    if (!id) return;
    loadAll();
  }, [id]);

  // Auto-refresh monitoring data every 10s when not playing replay
  useEffect(() => {
    if (!id || isPlaying) return;
    const interval = setInterval(() => {
      refreshData();
    }, 10000);
    return () => clearInterval(interval);
  }, [id, isPlaying]);

  async function loadAll() {
    setIsLoading(true);
    try {
      const [d, r, f] = await Promise.all([
        getMonitoringDetail(id!),
        getReplayData(id!),
        getFlags(id!),
      ]);
      setDetail(d);
      setReplay(r);
      setFlags(f);
      getReport(id!).then(setReport).catch(() => {});
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to load submission details" });
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshData() {
    try {
      const [d, r, f] = await Promise.all([
        getMonitoringDetail(id!),
        getReplayData(id!),
        getFlags(id!),
      ]);
      setDetail(d);
      // Only update replay if new snapshots arrived, preserve timeline position
      if (r && replay) {
        const newTotal = r.keyframes.length + r.diffs.length;
        const oldTotal = replay.keyframes.length + replay.diffs.length;
        if (newTotal !== oldTotal) {
          setReplay(r);
        }
      } else {
        setReplay(r);
      }
      setFlags(f);
    } catch {
      // Silent fail on background refresh
    }
  }

  const timelineEntries = useMemo(() => {
    if (!replay) return [];
    const entries: { sequence: number; captured_at: string; type: "keyframe" | "diff" }[] = [];
    for (const kf of replay.keyframes) entries.push({ sequence: kf.sequence_number, captured_at: kf.captured_at, type: "keyframe" });
    for (const d of replay.diffs) entries.push({ sequence: d.sequence_number, captured_at: d.captured_at, type: "diff" });
    entries.sort((a, b) => a.sequence - b.sequence);
    return entries;
  }, [replay]);

  const currentReconstructed = useMemo((): ReconstructedContent => {
    if (!replay || timelineEntries.length === 0) return { text: "", contentType: "text" };
    const targetSeq = timelineEntries[timelinePosition]?.sequence ?? 0;
    return reconstructAtPosition(replay, targetSeq);
  }, [replay, timelineEntries, timelinePosition]);

  const currentEntry = timelineEntries[timelinePosition];
  const wordCount = useMemo(() => currentReconstructed.text.trim().split(/\s+/).filter(Boolean).length, [currentReconstructed]);
  const charCount = currentReconstructed.text.length;

  // Map flags to their nearest timeline position for markers
  const flagPositions = useMemo(() => {
    if (!flags.length || !timelineEntries.length) return [];
    return flags.map((flag) => {
      const flagTime = new Date(flag.timestamp).getTime();
      let closestIdx = 0;
      let closestDist = Infinity;
      for (let i = 0; i < timelineEntries.length; i++) {
        const dist = Math.abs(new Date(timelineEntries[i].captured_at).getTime() - flagTime);
        if (dist < closestDist) { closestDist = dist; closestIdx = i; }
      }
      return { flag, timelineIndex: closestIdx };
    });
  }, [flags, timelineEntries]);

  // Split content into pages: each page is ~3000 chars or split on many newlines
  const pages = useMemo(() => {
    if (!currentContent) return [];
    // Split on 3+ consecutive newlines (paragraph breaks that act as page breaks)
    const rawPages = currentContent.split(/\n{3,}/);
    // Further split any page that's very long (>3000 chars) into chunks
    const result: string[] = [];
    for (const page of rawPages) {
      if (page.length <= 3000) {
        result.push(page);
      } else {
        // Split long page by paragraphs
        const paragraphs = page.split(/\n\n/);
        let current = "";
        for (const para of paragraphs) {
          if ((current + para).length > 3000 && current.length > 0) {
            result.push(current.trim());
            current = para;
          } else {
            current = current ? current + "\n\n" + para : para;
          }
        }
        if (current.trim()) result.push(current.trim());
      }
    }
    return result.filter(p => p.trim().length > 0);
  }, [currentContent]);

  useEffect(() => {
    if (!isPlaying || timelineEntries.length === 0) return;
    const interval = setInterval(() => {
      setTimelinePosition((prev) => {
        if (prev >= timelineEntries.length - 1) { setIsPlaying(false); return prev; }
        return prev + 1;
      });
    }, 1000 / playbackSpeed);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, timelineEntries.length]);

  async function handleToggleMonitoring() {
    if (!detail) return;
    try {
      if (detail.monitoring_state === "stopped") {
        await resumeMonitoring(id!);
        toast({ title: "Monitoring resumed" });
      } else {
        await pauseMonitoring(id!);
        toast({ title: "Monitoring paused" });
      }
      const d = await getMonitoringDetail(id!);
      setDetail(d);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to toggle monitoring" });
    }
  }

  const [syncing, setSyncing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const activeHighlights = useMemo((): HighlightRange[] => {
    if (!selectedFlag) return [];
    return getHighlightRangesFromFlag(selectedFlag);
  }, [selectedFlag]);

  async function handleAnalyze() {
    if (!id || analyzing) return;
    setAnalyzing(true);
    try {
      const result = await triggerAnalysis(id);
      if (result.status === "skipped") {
        toast({ title: "Analysis skipped", description: result.reason === "already_analyzed" ? "Content already analyzed" : "Insufficient content" });
      } else {
        const parts = [];
        if (result.ai_flag_created) parts.push("AI content detected");
        if (result.plagiarism_flag_created) parts.push("plagiarism detected");
        toast({ title: "Analysis complete", description: parts.length ? parts.join(", ") : "No issues found" });
      }
      // Refresh flags and report immediately
      const f = await getFlags(id!);
      setFlags(f);
      getReport(id!).then(setReport).catch(() => {});
    } catch (e: any) {
      toast({ variant: "destructive", title: "Analysis failed", description: e.message || "Could not start analysis" });
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleSyncNow() {
    if (!id || syncing) return;
    setSyncing(true);
    try {
      const result = await forcePoll(id);
      toast({ title: result.detail, description: result.sequence != null ? `Snapshot #${result.sequence}` : undefined });
      await refreshData();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync failed", description: e.message || "Could not fetch latest content" });
    } finally {
      setSyncing(false);
    }
  }

  async function handleFlagUpdate(flagId: string, status: string) {
    try {
      await updateFlag(id!, flagId, status);
      setFlags((prev) => prev.map((f) => (f._id === flagId ? { ...f, teacher_status: status as FlagType["teacher_status"] } : f)));
      toast({ title: "Flag updated" });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to update flag" });
    }
  }

  function renderHighlightedText(text: string, highlights: HighlightRange[]): React.ReactNode {
    if (!highlights.length) return text;

    // Collect all split points
    const points = new Set<number>();
    points.add(0);
    points.add(text.length);
    for (const h of highlights) {
      if (h.start >= 0 && h.start <= text.length) points.add(h.start);
      if (h.end >= 0 && h.end <= text.length) points.add(h.end);
    }
    const sorted = Array.from(points).sort((a, b) => a - b);
    const segments: React.ReactNode[] = [];

    for (let i = 0; i < sorted.length - 1; i++) {
      const start = sorted[i];
      const end = sorted[i + 1];
      const segText = text.slice(start, end);
      if (!segText) continue;

      const covering = highlights.find((h) => h.start <= start && h.end >= end);
      if (covering) {
        segments.push(
          <mark
            key={i}
            title={covering.label}
            style={{ backgroundColor: covering.color, borderRadius: "2px", padding: "0 1px" }}
          >
            {segText}
          </mark>
        );
      } else {
        segments.push(<React.Fragment key={i}>{segText}</React.Fragment>);
      }
    }
    return <>{segments}</>;
  }

  if (isLoading) {
    return <DashboardLayout><div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;
  }

  if (!detail) {
    return <DashboardLayout><p className="text-center text-muted-foreground py-20">Submission not found.</p></DashboardLayout>;
  }

  const stateColor = getMonitoringStateColor(detail.monitoring_state);

  return (
    <DashboardLayout fullScreen>
      <div className="h-full flex flex-col gap-3 max-w-[1600px] mx-auto">
        {/* Header — compact */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
<<<<<<< HEAD
              <h1 className="text-2xl font-semibold text-foreground">{detail.student_name || detail.student_email}</h1>
              <p className="text-muted-foreground mt-0.5 text-sm">{detail.assignment_title} · {detail.classroom_name}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full ${stateColor.bg} ${stateColor.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${stateColor.dot} ${detail.monitoring_state === "active" ? "animate-pulse" : ""}`} />
                {detail.monitoring_state}
              </span>
              <button onClick={handleToggleMonitoring} className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-secondary transition-colors">
                {detail.monitoring_state === "stopped" ? <><Play className="w-4 h-4" /> Resume</> : <><Pause className="w-4 h-4" /> Pause</>}
              </button>
              {detail.drive_file_url && (
                <a href={detail.drive_file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg text-sm text-primary-foreground transition-colors">
                  <ExternalLink className="w-4 h-4" /> Open Doc
                </a>
              )}
=======
              <h1 className="text-lg font-semibold text-foreground leading-tight">{detail.student_name || detail.student_email}</h1>
              <p className="text-muted-foreground text-xs">{detail.assignment_title} · {detail.classroom_name}</p>
>>>>>>> bb891d8e782f7073a5ed20b32c5c9195ffba4b3f
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${stateColor.bg} ${stateColor.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${stateColor.dot} ${detail.monitoring_state === "active" ? "animate-pulse" : ""}`} />
              {detail.monitoring_state}
            </span>
            <button onClick={handleToggleMonitoring} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs text-foreground hover:bg-secondary transition-colors">
              {detail.monitoring_state === "stopped" ? <><Play className="w-3.5 h-3.5" /> Resume</> : <><Pause className="w-3.5 h-3.5" /> Pause</>}
            </button>
            <button onClick={handleSyncNow} disabled={syncing} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs text-foreground hover:bg-secondary disabled:opacity-50 transition-colors">
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} /> {syncing ? "Syncing..." : "Sync Now"}
            </button>
            <button onClick={handleAnalyze} disabled={analyzing} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs text-foreground hover:bg-secondary disabled:opacity-50 transition-colors">
              <AlertTriangle className={`w-3.5 h-3.5 ${analyzing ? "animate-pulse" : ""}`} /> {analyzing ? "Analyzing..." : "Analyze"}
            </button>
            {detail.drive_file_url && (
              <a href={detail.drive_file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a73e8] hover:bg-[#1557b0] rounded-lg text-xs text-white transition-colors">
                <ExternalLink className="w-3.5 h-3.5" /> Open Doc
              </a>
            )}
          </div>
        </div>

        {/* Tabs — compact */}
        <div className="flex gap-1 bg-secondary rounded-lg p-0.5 w-fit flex-shrink-0">
          {(["replay", "flags", "report"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${activeTab === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {tab === "flags" ? `Flags (${flags.length})` : tab}
            </button>
          ))}
        </div>

        {/* Replay Tab — 70/30 split, fills remaining height */}
        {activeTab === "replay" && (
          <div className="flex gap-3 flex-1 min-h-0">
            {/* Left: Replay Viewer (70%) */}
            <div className="flex-[7] min-w-0 flex flex-col">
              <div className="rounded-xl overflow-hidden border border-border flex flex-col flex-1 min-h-0">
                {timelineEntries.length > 0 ? (
                  <>
                    {/* Google Docs title bar */}
                    <div className="bg-white border-b border-[#dadce0] px-3 py-1 flex items-center justify-between flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 48 48"><path fill="#2196F3" d="M13 6h16l10 10v26H13z"/><path fill="#1565C0" d="M29 6l10 10H29z"/><path fill="#E3F2FD" d="M17 22h14v2H17zm0 4h14v2H17zm0 4h10v2H17z"/></svg>
                        <div className="min-w-0">
                          <p className="text-[#202124] text-sm font-normal leading-tight truncate">{detail.assignment_title}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[#5f6368] flex-shrink-0">
                        {currentEntry && <span className="bg-[#e8f0fe] text-[#1967d2] px-2 py-0.5 rounded-full font-medium">{new Date(currentEntry.captured_at).toLocaleString()}</span>}
                        <span>{wordCount} words</span>
                        <span>{charCount} chars</span>
                      </div>
                    </div>
<<<<<<< HEAD
                    <div>
                      <p className="text-[#202124] text-sm font-medium leading-tight">{detail.assignment_title}</p>
                      <p className="text-[#5f6368] text-xs leading-tight">{detail.student_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#5f6368]">
                    {currentEntry && (
                      <span className="bg-[#e8f0fe] text-[#1967d2] px-2.5 py-1 rounded-full font-medium">
                        {new Date(currentEntry.captured_at).toLocaleString()}
                      </span>
                    )}
                    <span>{wordCount} words</span>
                    <span>{charCount} chars</span>
                  </div>
                </div>

                {/* Doc content - paginated like Google Docs */}
                <div className="bg-[#f8f9fa] min-h-[500px] max-h-[600px] overflow-auto flex flex-col items-center py-8 px-4 gap-6">
                  {pages.length > 0 ? (
                    pages.map((pageContent, i) => (
                      <div
                        key={i}
                        className="bg-white shadow-md w-full max-w-[816px] flex-shrink-0"
                        style={{ minHeight: "1056px", padding: "72px" }}
                      >
                        <div
                          className="text-[#202124] font-['Arial',sans-serif]"
                          style={{
                            fontSize: "11pt",
                            lineHeight: "1.5",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                          }}
                        >
                          {pageContent}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      className="bg-white shadow-md w-full max-w-[816px] flex-shrink-0"
                      style={{ minHeight: "1056px", padding: "72px" }}
                    >
                      <p className="text-[#80868b] text-sm italic">Empty document</p>
                    </div>
                  )}
                </div>

                {/* Playback controls */}
                <div className="bg-card border-t border-border px-5 py-3">
                  <div className="mb-3">
                    <input
                      type="range"
                      min={0}
                      max={Math.max(0, timelineEntries.length - 1)}
                      value={timelinePosition}
                      onChange={(e) => { setTimelinePosition(parseInt(e.target.value, 10)); setIsPlaying(false); }}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-blue-500"
                      style={{
                        background: `linear-gradient(to right, hsl(var(--primary)) ${(timelinePosition / Math.max(1, timelineEntries.length - 1)) * 100}%, hsl(var(--border)) ${(timelinePosition / Math.max(1, timelineEntries.length - 1)) * 100}%)`
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setTimelinePosition(0); setIsPlaying(false); }} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                        <SkipBack className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => setTimelinePosition(Math.max(0, timelinePosition - 5))} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                        <Rewind className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => setTimelinePosition(Math.max(0, timelinePosition - 1))} disabled={timelinePosition === 0} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-30 transition-colors">
                        <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => { if (timelinePosition >= timelineEntries.length - 1) setTimelinePosition(0); setIsPlaying(!isPlaying); }}
                        className="p-2.5 rounded-full bg-primary hover:bg-primary/90 transition-colors mx-1"
                      >
                        {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
                      </button>
                      <button onClick={() => setTimelinePosition(Math.min(timelineEntries.length - 1, timelinePosition + 1))} disabled={timelinePosition >= timelineEntries.length - 1} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-30 transition-colors">
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => setTimelinePosition(Math.min(timelineEntries.length - 1, timelinePosition + 5))} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                        <FastForward className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => { setTimelinePosition(timelineEntries.length - 1); setIsPlaying(false); }} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                        <SkipForward className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                    <span className="text-sm text-muted-foreground font-mono">{timelinePosition + 1} / {timelineEntries.length}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Speed</span>
                      {[0.5, 1, 2, 4].map((speed) => (
                        <button key={speed} onClick={() => setPlaybackSpeed(speed)}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${playbackSpeed === speed ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"}`}>
                          {speed}x
                        </button>
=======
                    {/* Google Docs menu bar */}
                    <div className="bg-white border-b border-[#dadce0] px-3 py-0 flex items-center gap-1 flex-shrink-0">
                      {["File", "Edit", "View", "Insert", "Format", "Tools"].map((m) => (
                        <span key={m} className="text-[#444746] text-[13px] px-2 py-1 cursor-default select-none">{m}</span>
>>>>>>> bb891d8e782f7073a5ed20b32c5c9195ffba4b3f
                      ))}
                    </div>
                    {/* Google Docs toolbar (cosmetic) */}
                    <GoogleDocsToolbar />
                    {/* Document canvas — scrollable, mimics Google Docs background */}
                    <div className="bg-[#f0f0f0] flex-1 min-h-0 overflow-auto flex justify-center" style={{ padding: "16px 24px" }}>
                      {/* US Letter page: 816×1056px (8.5×11in @96dpi), 1in margins */}
                      <div
                        className="bg-white flex-shrink-0"
                        style={{
                          width: 816,
                          minHeight: 1056,
                          padding: "96px 96px",
                          boxShadow: "0 1px 3px 1px rgba(60,64,67,0.15), 0 1px 2px 0 rgba(60,64,67,0.3)",
                        }}
                      >
                        {currentReconstructed.text ? (
                          currentReconstructed.contentType === "docs_json" && currentReconstructed.docJson ? (
                            <DocsRenderer docJson={currentReconstructed.docJson} highlightRanges={activeHighlights} />
                          ) : (
                            <div className="text-[#202124] whitespace-pre-wrap break-words" style={{ fontFamily: "Arial, sans-serif", fontSize: "11pt", lineHeight: "1.15" }}>
                              {activeHighlights.length > 0
                                ? renderHighlightedText(currentReconstructed.text, activeHighlights)
                                : currentReconstructed.text}
                            </div>
                          )
                        ) : (
                          <div className="text-[#80868b]" style={{ fontFamily: "Arial, sans-serif", fontSize: "11pt", lineHeight: "1.15" }}>
                            {/* Empty doc cursor blink */}
                            <span className="animate-pulse">|</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Playback controls — pinned to bottom */}
                    <div className="bg-card border-t border-border px-4 py-2 flex-shrink-0">
                      {/* Timeline slider with flag markers */}
                      <div className="mb-2 relative">
                        <input type="range" min={0} max={Math.max(0, timelineEntries.length - 1)} value={timelinePosition}
                          onChange={(e) => { setTimelinePosition(parseInt(e.target.value, 10)); setIsPlaying(false); }}
                          className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-blue-500 relative z-10"
                          style={{ background: `linear-gradient(to right, #1a73e8 ${(timelinePosition / Math.max(1, timelineEntries.length - 1)) * 100}%, #e2e8f0 ${(timelinePosition / Math.max(1, timelineEntries.length - 1)) * 100}%)` }}
                        />
                        {/* Flag markers on timeline */}
                        {flagPositions.map(({ flag, timelineIndex }) => {
                          const pct = timelineEntries.length > 1 ? (timelineIndex / (timelineEntries.length - 1)) * 100 : 50;
                          return (
                            <button
                              key={flag._id}
                              onClick={() => { setTimelinePosition(timelineIndex); setIsPlaying(false); setSelectedFlag(flag); setSidePanelTab("insights"); }}
                              className={`absolute top-1/2 -translate-y-1/2 z-20 w-3 h-3 rounded-full border-2 border-background ${flag.flag_type === "ai_detected" ? "bg-violet-500" : flag.flag_type === "plagiarism" ? "bg-red-500" : flag.severity === "high" ? "bg-red-500" : flag.severity === "medium" ? "bg-orange-500" : "bg-yellow-500"} hover:scale-150 transition-transform`}
                              style={{ left: `calc(${pct}% - 6px)` }}
                              title={`${flag.flag_type.replace(/_/g, " ")} (${flag.severity})`}
                            />
                          );
                        })}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-0.5">
                          <button onClick={() => { setTimelinePosition(0); setIsPlaying(false); }} className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><SkipBack className="w-3.5 h-3.5 text-muted-foreground" /></button>
                          <button onClick={() => setTimelinePosition(Math.max(0, timelinePosition - 5))} className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><Rewind className="w-3.5 h-3.5 text-muted-foreground" /></button>
                          <button onClick={() => setTimelinePosition(Math.max(0, timelinePosition - 1))} disabled={timelinePosition === 0} className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-30 transition-colors"><ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" /></button>
                          <button onClick={() => { if (timelinePosition >= timelineEntries.length - 1) setTimelinePosition(0); setIsPlaying(!isPlaying); }} className="p-2 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] transition-colors mx-0.5">
                            {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
                          </button>
                          <button onClick={() => setTimelinePosition(Math.min(timelineEntries.length - 1, timelinePosition + 1))} disabled={timelinePosition >= timelineEntries.length - 1} className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-30 transition-colors"><ChevronRight className="w-3.5 h-3.5 text-muted-foreground" /></button>
                          <button onClick={() => setTimelinePosition(Math.min(timelineEntries.length - 1, timelinePosition + 5))} className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><FastForward className="w-3.5 h-3.5 text-muted-foreground" /></button>
                          <button onClick={() => { setTimelinePosition(timelineEntries.length - 1); setIsPlaying(false); }} className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><SkipForward className="w-3.5 h-3.5 text-muted-foreground" /></button>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">{timelinePosition + 1} / {timelineEntries.length}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-muted-foreground">Speed</span>
                          {[0.5, 1, 2, 4].map((speed) => (
                            <button key={speed} onClick={() => setPlaybackSpeed(speed)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${playbackSpeed === speed ? "bg-[#1a73e8]/10 text-[#1a73e8]" : "text-muted-foreground hover:bg-secondary"}`}>
                              {speed}x
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">No snapshots recorded yet</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">Snapshots will appear once the student starts editing</p>
                    <button onClick={handleSyncNow} disabled={syncing} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 rounded-lg text-sm text-white transition-colors">
                      <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} /> {syncing ? "Syncing..." : "Fetch Snapshot Now"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Side Panel (30%) */}
            <div className="flex-[3] min-w-0 flex flex-col">
              <div className="rounded-xl border border-border overflow-hidden flex flex-col flex-1 min-h-0">
                {/* Panel tab switcher */}
                <div className="flex border-b border-border bg-card flex-shrink-0">
                  <button
                    onClick={() => setSidePanelTab("insights")}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${sidePanelTab === "insights" ? "text-foreground border-b-2 border-[#1a73e8] bg-background" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Eye className="w-3.5 h-3.5" /> Insights
                  </button>
                  <button
                    onClick={() => setSidePanelTab("notes")}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${sidePanelTab === "notes" ? "text-foreground border-b-2 border-[#1a73e8] bg-background" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Notes
                  </button>
                </div>

                {/* Panel content — scrolls independently */}
                <div className="flex-1 min-h-0 overflow-auto bg-card">
                  {sidePanelTab === "insights" ? (
                    <div className="p-3">
                      {selectedFlag ? (
                        <div className="space-y-3">
                          {/* Flag header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className={`w-4 h-4 ${getSeverityColor(selectedFlag.severity).text}`} />
                              <h3 className="text-xs font-semibold text-foreground capitalize">{selectedFlag.flag_type.replace(/_/g, " ")}</h3>
                            </div>
                            <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${getSeverityColor(selectedFlag.severity).bg} ${getSeverityColor(selectedFlag.severity).text}`}>
                              {selectedFlag.severity}
                            </span>
                          </div>

                          {/* Timestamp */}
                          <div className="text-[10px] text-muted-foreground">
                            {new Date(selectedFlag.timestamp).toLocaleString()}
                          </div>

                          {/* Description / explanation */}
                          <div className="rounded-lg bg-secondary/50 p-2.5 space-y-1.5">
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">What happened</p>
                            <p className="text-xs text-foreground leading-relaxed">
                              {selectedFlag.flag_type === "paste_burst" && (
                                <>A large amount of text was added in a single edit — <span className="font-semibold">{selectedFlag.evidence?.chars_added?.toLocaleString() ?? "many"} characters</span> appeared between snapshots. This may indicate copy-pasting from an external source.</>
                              )}
                              {selectedFlag.flag_type === "ai_detected" && (
                                <>AI-generated content was detected — <span className="font-semibold">{Math.round((selectedFlag.evidence?.overall_ai_score ?? 0) * 100)}% overall AI score</span> ({selectedFlag.evidence?.ai_sentence_count ?? 0} of {selectedFlag.evidence?.total_sentence_count ?? 0} sentences flagged). Click highlighted text in the document to see per-sentence scores.</>
                              )}
                              {selectedFlag.flag_type === "plagiarism" && (
                                <>Content matches found in external sources — <span className="font-semibold">{selectedFlag.evidence?.overall_match_percent ?? 0}% match</span> ({selectedFlag.evidence?.total_matched_words ?? 0} words). Highlighted passages link to matched sources.</>
                              )}
                              {selectedFlag.flag_type === "manual" && (
                                <>This flag was manually added by a teacher for review.</>
                              )}
                              {!["paste_burst", "ai_detected", "plagiarism", "manual"].includes(selectedFlag.flag_type) && (
                                <>Suspicious activity of type "{selectedFlag.flag_type.replace(/_/g, " ")}" was detected at this point in the timeline.</>
                              )}
                            </p>
                          </div>

                          {/* Evidence details */}
                          {selectedFlag.evidence && Object.keys(selectedFlag.evidence).length > 0 && (
                            <div className="space-y-1.5">
                              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Evidence</p>
                              <div className="rounded-lg border border-border divide-y divide-border">
                                {Object.entries(selectedFlag.evidence)
                                  .filter(([key]) => key !== "highlighted_ranges")
                                  .map(([key, value]) => (
                                  <div key={key} className="flex items-start justify-between px-2.5 py-1.5">
                                    <span className="text-[10px] text-muted-foreground capitalize">{key.replace(/_/g, " ")}</span>
                                    <span className="text-[10px] text-foreground font-medium text-right max-w-[60%] break-words">
                                      {typeof value === "number" ? value.toLocaleString() : String(value)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              {/* Source URLs for plagiarism flags */}
                              {selectedFlag.flag_type === "plagiarism" && selectedFlag.evidence?.highlighted_ranges?.length > 0 && (
                                <div className="mt-1.5">
                                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Matched Sources</p>
                                  <div className="space-y-1">
                                    {[...new Map(
                                      (selectedFlag.evidence.highlighted_ranges as any[])
                                        .filter((r: any) => r.source_url)
                                        .map((r: any) => [r.source_url, r])
                                    ).values()].map((r: any, i: number) => (
                                      <a
                                        key={i}
                                        href={r.source_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block text-[10px] text-blue-500 hover:text-blue-400 truncate"
                                        title={r.source_url}
                                      >
                                        {r.source_title || r.source_url}
                                        <span className="text-muted-foreground ml-1">({r.match_type})</span>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Teacher actions */}
                          <div className="space-y-1.5 pt-2 border-t border-border">
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Status</p>
                            <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full ${selectedFlag.teacher_status === "false_positive" ? "bg-secondary text-muted-foreground" : selectedFlag.teacher_status === "needs_followup" ? "bg-orange-500/10 text-orange-500" : "bg-blue-500/10 text-blue-500"}`}>
                              {selectedFlag.teacher_status.replace(/_/g, " ")}
                            </span>
                            <div className="flex gap-2 mt-1.5">
                              {selectedFlag.teacher_status !== "false_positive" && (
                                <button
                                  onClick={() => { handleFlagUpdate(selectedFlag._id, "false_positive"); setSelectedFlag({ ...selectedFlag, teacher_status: "false_positive" }); }}
                                  className="flex-1 text-[10px] px-2 py-1.5 border border-border hover:bg-secondary rounded-lg text-muted-foreground transition-colors"
                                >
                                  False Positive
                                </button>
                              )}
                              {selectedFlag.teacher_status !== "needs_followup" && (
                                <button
                                  onClick={() => { handleFlagUpdate(selectedFlag._id, "needs_followup"); setSelectedFlag({ ...selectedFlag, teacher_status: "needs_followup" }); }}
                                  className="flex-1 text-[10px] px-2 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 rounded-lg text-orange-500 transition-colors"
                                >
                                  Needs Follow-up
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Flagged moments list */}
                          {flags.length > 1 && (
                            <div className="space-y-1.5 pt-2 border-t border-border">
                              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">All flags ({flags.length})</p>
                              <div className="space-y-0.5">
                                {flags.map((f) => (
                                  <button
                                    key={f._id}
                                    onClick={() => {
                                      setSelectedFlag(f);
                                      const pos = flagPositions.find((fp) => fp.flag._id === f._id);
                                      if (pos) { setTimelinePosition(pos.timelineIndex); setIsPlaying(false); }
                                    }}
                                    className={`w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] transition-colors ${selectedFlag._id === f._id ? "bg-[#1a73e8]/10 border border-[#1a73e8]/30" : "hover:bg-secondary"}`}
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${f.flag_type === "ai_detected" ? "bg-violet-500" : f.flag_type === "plagiarism" ? "bg-red-500" : f.severity === "high" ? "bg-red-500" : f.severity === "medium" ? "bg-orange-500" : "bg-yellow-500"}`} />
                                    <span className="text-foreground capitalize truncate">{f.flag_type.replace(/_/g, " ")}</span>
                                    <span className="text-muted-foreground ml-auto flex-shrink-0">{new Date(f.timestamp).toLocaleTimeString()}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                          <Flag className="w-8 h-8 text-muted-foreground/20 mb-2" />
                          <p className="text-xs text-muted-foreground">Click a flag marker on the timeline to inspect it</p>
                          {flags.length > 0 ? (
                            <p className="text-[10px] text-muted-foreground/60 mt-1">{flags.length} flag{flags.length !== 1 ? "s" : ""} detected</p>
                          ) : (
                            <p className="text-[10px] text-muted-foreground/60 mt-1">No flags detected yet</p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Notes tab — placeholder */
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center p-3">
                      <MessageSquare className="w-8 h-8 text-muted-foreground/20 mb-2" />
                      <p className="text-xs text-muted-foreground">Coming soon</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">This space is reserved for future use</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Flags Tab */}
        {activeTab === "flags" && (
<<<<<<< HEAD
          <div className="gc-card p-4">
=======
          <div className="flex-1 min-h-0 overflow-auto gc-card p-4">
>>>>>>> bb891d8e782f7073a5ed20b32c5c9195ffba4b3f
            {flags.length > 0 ? (
              <div className="space-y-2">
                {flags.map((flag) => {
                  const sevColor = getSeverityColor(flag.severity);
                  return (
                    <div key={flag._id} className="flex items-start justify-between p-3 rounded-lg border border-border bg-secondary/30">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={`w-4 h-4 mt-0.5 ${sevColor.text}`} />
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-foreground font-medium text-xs capitalize">{flag.flag_type.replace(/_/g, " ")}</span>
                            <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${sevColor.bg} ${sevColor.text}`}>{flag.severity}</span>
                          </div>
                          <p className="text-muted-foreground text-[10px]">{new Date(flag.timestamp).toLocaleString()}</p>
                          {flag.evidence?.chars_added && <p className="text-muted-foreground text-[10px] mt-0.5">{flag.evidence.chars_added.toLocaleString()} characters added</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${flag.teacher_status === "false_positive" ? "bg-secondary text-muted-foreground" : flag.teacher_status === "needs_followup" ? "bg-orange-500/10 text-orange-500" : "bg-blue-500/10 text-blue-500"}`}>
                          {flag.teacher_status.replace(/_/g, " ")}
                        </span>
                        {flag.teacher_status !== "false_positive" && (
<<<<<<< HEAD
                          <button onClick={() => handleFlagUpdate(flag._id, "false_positive")} className="text-xs px-3 py-1.5 border border-border hover:bg-secondary rounded-lg text-muted-foreground transition-colors">
                            False Positive
                          </button>
                        )}
                        {flag.teacher_status !== "needs_followup" && (
                          <button onClick={() => handleFlagUpdate(flag._id, "needs_followup")} className="text-xs px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 rounded-lg text-orange-500 transition-colors">
                            Needs Follow-up
                          </button>
=======
                          <button onClick={() => handleFlagUpdate(flag._id, "false_positive")} className="text-[10px] px-2 py-1 border border-border hover:bg-secondary rounded-lg text-muted-foreground transition-colors">False Positive</button>
                        )}
                        {flag.teacher_status !== "needs_followup" && (
                          <button onClick={() => handleFlagUpdate(flag._id, "needs_followup")} className="text-[10px] px-2 py-1 bg-orange-500/10 hover:bg-orange-500/20 rounded-lg text-orange-500 transition-colors">Needs Follow-up</button>
>>>>>>> bb891d8e782f7073a5ed20b32c5c9195ffba4b3f
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <Flag className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">No flags detected</p>
              </div>
            )}
          </div>
        )}

        {/* Report Tab */}
        {activeTab === "report" && (
<<<<<<< HEAD
          <div className="gc-card p-4">
=======
          <div className="flex-1 min-h-0 overflow-auto gc-card p-4">
>>>>>>> bb891d8e782f7073a5ed20b32c5c9195ffba4b3f
            {report ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground mb-1.5">Summary Status</h3>
                  <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full capitalize ${report.summary_status === "clean" ? "bg-green-500/10 text-green-600" : report.summary_status === "needs_review" ? "bg-red-500/10 text-red-500" : report.summary_status === "minor_concerns" ? "bg-orange-500/10 text-orange-500" : "bg-secondary text-muted-foreground"}`}>
                    {report.summary_status.replace(/_/g, " ")}
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground mb-2">Activity Overview</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg border border-border bg-secondary/30">
                      <p className="text-[10px] text-muted-foreground mb-0.5">Total Snapshots</p>
                      <p className="text-lg font-bold text-foreground">{report.activity_overview.total_snapshots}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-secondary/30">
                      <p className="text-[10px] text-muted-foreground mb-0.5">First Activity</p>
                      <p className="text-xs text-foreground">{report.activity_overview.first_activity ? new Date(report.activity_overview.first_activity).toLocaleString() : "N/A"}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-secondary/30">
                      <p className="text-[10px] text-muted-foreground mb-0.5">Last Activity</p>
                      <p className="text-xs text-foreground">{report.activity_overview.last_activity ? new Date(report.activity_overview.last_activity).toLocaleString() : "N/A"}</p>
                    </div>
                  </div>
                </div>
                {(report.ai_detection_score != null || report.plagiarism_score != null) && (
                  <div>
                    <h3 className="text-xs font-medium text-muted-foreground mb-2">Detection Scores</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg border border-border bg-secondary/30">
                        <p className="text-[10px] text-muted-foreground mb-0.5">AI Detection</p>
                        <p className={`text-lg font-bold ${(report.ai_detection_score ?? 0) > 0.5 ? "text-violet-500" : "text-green-500"}`}>
                          {report.ai_detection_score != null ? `${Math.round(report.ai_detection_score * 100)}%` : "N/A"}
                        </p>
                        {report.ai_detection_provider && <p className="text-[10px] text-muted-foreground mt-0.5">via {report.ai_detection_provider}</p>}
                      </div>
                      <div className="p-3 rounded-lg border border-border bg-secondary/30">
                        <p className="text-[10px] text-muted-foreground mb-0.5">Plagiarism</p>
                        <p className={`text-lg font-bold ${(report.plagiarism_score ?? 0) > 15 ? "text-red-500" : "text-green-500"}`}>
                          {report.plagiarism_score != null ? `${report.plagiarism_score}%` : "N/A"}
                        </p>
                        {report.plagiarism_provider && <p className="text-[10px] text-muted-foreground mt-0.5">via {report.plagiarism_provider}</p>}
                      </div>
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground mb-2">Flags Summary</h3>
                  <div className="p-3 rounded-lg border border-border bg-secondary/30">
                    <p className="text-xs text-foreground mb-1.5">Total: {report.flags_summary.total_flags}</p>
                    {Object.entries(report.flags_summary.by_type).length > 0 ? (
                      <div className="space-y-1">
                        {Object.entries(report.flags_summary.by_type).map(([type, count]) => (
                          <div key={type} className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground capitalize">{type.replace(/_/g, " ")}</span>
                            <span className="text-foreground font-medium">{count as number}</span>
                          </div>
                        ))}
                      </div>
<<<<<<< HEAD
                    ) : (
                      <p className="text-muted-foreground text-sm">No flags recorded</p>
                    )}
=======
                    ) : <p className="text-muted-foreground text-xs">No flags recorded</p>}
>>>>>>> bb891d8e782f7073a5ed20b32c5c9195ffba4b3f
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">Report generated: {new Date(report.generated_at).toLocaleString()}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="w-6 h-6 text-muted-foreground/30 animate-spin mb-3" />
                <p className="text-muted-foreground text-sm">Generating report...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}