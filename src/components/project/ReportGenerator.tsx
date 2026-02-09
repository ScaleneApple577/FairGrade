import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  Download,
  Mail,
  CheckCircle,
  Loader2,
  Calendar,
  Users,
  BarChart3,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getContributionReport, exportReport } from "@/lib/reportUtils";
import { getAnalysisFlags } from "@/lib/analysisUtils";

interface ReportGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  projectId?: string;
}

export function ReportGenerator({ isOpen, onClose, projectName, projectId }: ReportGeneratorProps) {
  const [reportType, setReportType] = useState("full");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [options, setOptions] = useState({
    includeContributions: true,
    includeTimeline: true,
    includeFlags: true,
    includeGrades: true,
    anonymize: false,
  });

  const handleGenerate = async () => {
    if (!projectId) {
      toast.error("Project ID is required to generate report");
      return;
    }
    
    setIsGenerating(true);
    try {
      // Fetch contribution report: GET /api/reports/contribution/{projectId}
      const contributionData = await getContributionReport(projectId);
      
      let flagsData: any[] = [];
      if (options.includeFlags) {
        // Fetch analysis flags: GET /api/analysis/flags/{projectId}
        flagsData = await getAnalysisFlags(projectId);
      }
      
      setReportData({
        contribution: contributionData,
        flags: flagsData,
        generatedAt: new Date().toISOString(),
      });
      
      setIsComplete(true);
      toast.success("Report generated successfully!");
    } catch (error) {
      console.error("Failed to generate report:", error);
      toast.error("Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleDownload = async () => {
    if (!projectId) return;
    try {
      // Export report: POST /api/reports/export?report_type=contribution&project_id={id}
      const result = await exportReport("contribution", projectId);
      // Handle download - the result might be a URL or blob
      if (typeof result === 'string' && result.startsWith('http')) {
        window.open(result, '_blank');
      } else {
        toast.success("Report export initiated");
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export report");
    }
  };

  const handleClose = () => {
    setIsComplete(false);
    setIsGenerating(false);
    setReportData(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Generate Report</h2>
                  <p className="text-sm text-muted-foreground">{projectName}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {isComplete ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-success" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Report Ready!</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Your report has been generated and is ready for download.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Button onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button variant="outline" disabled>
                      <Mail className="h-4 w-4 mr-2" />
                      Email Report (Coming Soon)
                    </Button>
                  </div>
                </motion.div>
              ) : isGenerating ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-foreground mb-2">Generating Report...</h3>
                  <p className="text-sm text-muted-foreground">
                    This may take a few moments.
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {/* Report Type */}
                  <div>
                    <Label>Report Type</Label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Project Report</SelectItem>
                        <SelectItem value="summary">Executive Summary</SelectItem>
                        <SelectItem value="grades">Grade Breakdown Only</SelectItem>
                        <SelectItem value="flags">Flags & Issues Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Include Options */}
                  <div>
                    <Label className="mb-3 block">Include in Report</Label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                        <Checkbox
                          id="contributions"
                          checked={options.includeContributions}
                          onCheckedChange={(checked) =>
                            setOptions({ ...options, includeContributions: !!checked })
                          }
                        />
                        <div className="flex-1">
                          <label htmlFor="contributions" className="text-sm font-medium text-foreground cursor-pointer">
                            <Users className="h-4 w-4 inline mr-2" />
                            Contribution Breakdown
                          </label>
                          <p className="text-xs text-muted-foreground">Individual and group contribution data</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                        <Checkbox
                          id="timeline"
                          checked={options.includeTimeline}
                          onCheckedChange={(checked) =>
                            setOptions({ ...options, includeTimeline: !!checked })
                          }
                        />
                        <div className="flex-1">
                          <label htmlFor="timeline" className="text-sm font-medium text-foreground cursor-pointer">
                            <Calendar className="h-4 w-4 inline mr-2" />
                            Activity Timeline
                          </label>
                          <p className="text-xs text-muted-foreground">Chronological activity history</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                        <Checkbox
                          id="flags"
                          checked={options.includeFlags}
                          onCheckedChange={(checked) =>
                            setOptions({ ...options, includeFlags: !!checked })
                          }
                        />
                        <div className="flex-1">
                          <label htmlFor="flags" className="text-sm font-medium text-foreground cursor-pointer">
                            <Shield className="h-4 w-4 inline mr-2" />
                            AI & Plagiarism Flags
                          </label>
                          <p className="text-xs text-muted-foreground">Suspicious activity alerts</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                        <Checkbox
                          id="grades"
                          checked={options.includeGrades}
                          onCheckedChange={(checked) =>
                            setOptions({ ...options, includeGrades: !!checked })
                          }
                        />
                        <div className="flex-1">
                          <label htmlFor="grades" className="text-sm font-medium text-foreground cursor-pointer">
                            <BarChart3 className="h-4 w-4 inline mr-2" />
                            Grade Suggestions
                          </label>
                          <p className="text-xs text-muted-foreground">Recommended grade adjustments</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Privacy Option */}
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-warning/30 bg-warning/5">
                    <Checkbox
                      id="anonymize"
                      checked={options.anonymize}
                      onCheckedChange={(checked) =>
                        setOptions({ ...options, anonymize: !!checked })
                      }
                    />
                    <div className="flex-1">
                      <label htmlFor="anonymize" className="text-sm font-medium text-foreground cursor-pointer">
                        Anonymize Student Names
                      </label>
                      <p className="text-xs text-muted-foreground">Replace names with Student A, B, C...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {!isComplete && !isGenerating && (
              <div className="p-6 border-t border-border flex items-center justify-end gap-3">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleGenerate}>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
