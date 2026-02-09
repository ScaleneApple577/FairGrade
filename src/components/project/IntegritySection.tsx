import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Bot,
  FileSearch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  runAICheck,
  runPlagiarismCheck,
  getAnalysisFlags,
  countFlagsByType,
  getFlagSeverityColor,
  getFlagTypeInfo,
  type AnalysisFlag,
} from "@/lib/analysisUtils";

interface IntegritySectionProps {
  projectId: string;
}

export function IntegritySection({ projectId }: IntegritySectionProps) {
  const [flags, setFlags] = useState<AnalysisFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningAI, setIsRunningAI] = useState(false);
  const [isRunningPlagiarism, setIsRunningPlagiarism] = useState(false);

  const fetchFlags = async () => {
    setIsLoading(true);
    try {
      const data = await getAnalysisFlags(projectId);
      setFlags(data);
    } catch (error) {
      console.error("Failed to fetch flags:", error);
      setFlags([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, [projectId]);

  const handleRunAICheck = async () => {
    setIsRunningAI(true);
    try {
      await runAICheck(projectId);
      toast.success("AI check complete!");
      await fetchFlags();
    } catch (error) {
      console.error("AI check failed:", error);
      toast.error("AI check failed. Please try again.");
    } finally {
      setIsRunningAI(false);
    }
  };

  const handleRunPlagiarismCheck = async () => {
    setIsRunningPlagiarism(true);
    try {
      await runPlagiarismCheck(projectId);
      toast.success("Plagiarism check complete!");
      await fetchFlags();
    } catch (error) {
      console.error("Plagiarism check failed:", error);
      toast.error("Plagiarism check failed. Please try again.");
    } finally {
      setIsRunningPlagiarism(false);
    }
  };

  const flagCounts = countFlagsByType(flags);

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-purple-400" />
          <div>
            <h2 className="text-lg font-semibold text-white">Integrity Analysis</h2>
            <p className="text-sm text-slate-400">
              Check for AI-generated content and plagiarism
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchFlags}
          disabled={isLoading}
          className="text-slate-400 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <Button
          onClick={handleRunAICheck}
          disabled={isRunningAI || isRunningPlagiarism}
          className="bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25 border-0"
        >
          {isRunningAI ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Bot className="w-4 h-4 mr-2" />
          )}
          Run AI Check
        </Button>
        <Button
          onClick={handleRunPlagiarismCheck}
          disabled={isRunningAI || isRunningPlagiarism}
          className="bg-red-500/15 text-red-400 hover:bg-red-500/25 border-0"
        >
          {isRunningPlagiarism ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <FileSearch className="w-4 h-4 mr-2" />
          )}
          Run Plagiarism Check
        </Button>
      </div>

      {/* Summary Stats */}
      {flagCounts.total > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{flagCounts.ai}</p>
            <p className="text-xs text-yellow-400/70">AI Detected</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{flagCounts.plagiarism}</p>
            <p className="text-xs text-red-400/70">Plagiarism</p>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-orange-400">{flagCounts.other}</p>
            <p className="text-xs text-orange-400/70">Other Flags</p>
          </div>
        </div>
      )}

      {/* Flags List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
        </div>
      ) : flags.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-300 mb-3">
            Flags ({flags.length})
          </h3>
          {flags.map((flag, index) => {
            const typeInfo = getFlagTypeInfo(flag.type);
            const severityColor = getFlagSeverityColor(flag.severity);
            return (
              <motion.div
                key={flag.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-xl border ${severityColor}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{typeInfo.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{typeInfo.label}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${
                        flag.severity === "high" ? "bg-red-500/20 text-red-400" :
                        flag.severity === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-orange-500/20 text-orange-400"
                      }`}>
                        {flag.severity}
                      </span>
                      {flag.status && (
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          flag.status === "new" ? "bg-blue-500/20 text-blue-400" :
                          flag.status === "reviewed" ? "bg-slate-500/20 text-slate-400" :
                          flag.status === "dismissed" ? "bg-gray-500/20 text-gray-400" :
                          "bg-red-500/20 text-red-400"
                        }`}>
                          {flag.status}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-300 mb-1">{flag.message}</p>
                    {flag.file_name && (
                      <p className="text-xs text-slate-500">File: {flag.file_name}</p>
                    )}
                    {flag.details && (
                      <p className="text-xs text-slate-500 mt-1">{flag.details}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
          {/* TODO notice */}
          <p className="text-xs text-slate-600 mt-4">
            Note: Flag status management (Dismiss, Confirm Violation) is not yet available. 
            Status changes are frontend-only until the backend supports PUT /api/analysis/flags/{"{flag_id}"}.
          </p>
        </div>
      ) : (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-emerald-500/50 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No flags found</p>
          <p className="text-sm text-slate-500 mt-1">
            Run an analysis to check for AI content or plagiarism
          </p>
        </div>
      )}
    </div>
  );
}
