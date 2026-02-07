import { useState } from "react";
import { motion } from "framer-motion";
import { Flag, AlertTriangle, Shield, Copy, FileText, Search, ExternalLink, Check, X, MoreHorizontal } from "lucide-react";
import { TeacherLayout } from "@/components/teacher/TeacherLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FlagItem {
  id: string;
  studentName: string;
  studentInitials: string;
  studentColor: string;
  projectName: string;
  groupNumber: number;
  timestamp: string;
  severity: "high" | "medium" | "low";
  types: ("ai" | "plagiarism" | "paste")[];
  aiScore?: number;
  plagiarismScore?: number;
  pasteSize?: number;
  contentPreview: string;
  sourceUrl?: string;
  status: "pending" | "confirmed" | "dismissed";
}

const mockFlags: FlagItem[] = [
  {
    id: "1",
    studentName: "David Wilson",
    studentInitials: "DW",
    studentColor: "bg-orange-500",
    projectName: "CS 101 Final Project",
    groupNumber: 2,
    timestamp: "Feb 12, 2025 9:45 PM",
    severity: "high",
    types: ["ai", "plagiarism"],
    aiScore: 87,
    plagiarismScore: 76,
    pasteSize: 523,
    contentPreview: "The deployment of facial recognition technology in public spaces has sparked debates about surveillance and civil liberties. Critics argue that these systems represent an unwarranted intrusion into privacy...",
    sourceUrl: "https://techethics.org/ai-surveillance-debate",
    status: "pending",
  },
  {
    id: "2",
    studentName: "Alice Kim",
    studentInitials: "AK",
    studentColor: "bg-blue-500",
    projectName: "MATH 250 Midterm",
    groupNumber: 1,
    timestamp: "Feb 10, 2025 3:22 PM",
    severity: "medium",
    types: ["ai"],
    aiScore: 64,
    pasteSize: 287,
    contentPreview: "To solve this differential equation, we apply the method of separation of variables...",
    status: "pending",
  },
  {
    id: "3",
    studentName: "Bob Lee",
    studentInitials: "BL",
    studentColor: "bg-green-500",
    projectName: "CS 101 Final Project",
    groupNumber: 1,
    timestamp: "Feb 8, 2025 11:15 AM",
    severity: "low",
    types: ["paste"],
    aiScore: 12,
    plagiarismScore: 8,
    pasteSize: 412,
    contentPreview: "Likely legitimate work - low AI/plagiarism scores suggest original content pasted from personal notes.",
    status: "pending",
  },
];

function StatCard({ title, value, subtitle, icon, borderColor, iconBgColor }: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  borderColor: string;
  iconBgColor: string;
}) {
  return (
    <div className={`bg-card rounded-xl shadow-soft p-6 border-l-4 ${borderColor}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={`w-10 h-10 ${iconBgColor} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}

function FlagCard({ flag }: { flag: FlagItem }) {
  const severityConfig = {
    high: { label: "HIGH SEVERITY", className: "bg-destructive text-destructive-foreground" },
    medium: { label: "MEDIUM SEVERITY", className: "bg-warning text-warning-foreground" },
    low: { label: "LOW SEVERITY", className: "bg-success text-success-foreground" },
  };

  const typeConfig = {
    ai: { label: "AI Detection", className: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700" },
    plagiarism: { label: "Plagiarism", className: "bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700" },
    paste: { label: "Large Paste", className: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700" },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card rounded-xl shadow-soft overflow-hidden ${
        flag.severity === "high" ? "border-2 border-destructive" : "border-l-4 border-l-purple-500 border border-border"
      }`}
    >
      {flag.severity === "high" && (
        <div className="bg-destructive/10 px-6 py-4 border-b border-destructive/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className={severityConfig[flag.severity].className}>
                {severityConfig[flag.severity].label}
              </Badge>
              {flag.types.map((type) => (
                <Badge key={type} variant="outline" className={typeConfig[type].className}>
                  {typeConfig[type].label}
                </Badge>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">{flag.timestamp}</span>
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start gap-6">
          {/* Student Info */}
          <div className="flex items-center gap-3 min-w-[180px]">
            <div className={`w-16 h-16 ${flag.studentColor} rounded-full flex items-center justify-center text-white font-bold text-xl`}>
              {flag.studentInitials}
            </div>
            <div>
              <p className="font-bold text-lg text-foreground">{flag.studentName}</p>
              <p className="text-sm text-muted-foreground">{flag.projectName}</p>
              <p className="text-sm text-muted-foreground">Group {flag.groupNumber}</p>
            </div>
          </div>

          <div className="flex-1">
            {flag.severity !== "high" && (
              <div className="flex items-center gap-3 mb-4">
                <Badge className={severityConfig[flag.severity].className}>
                  {severityConfig[flag.severity].label}
                </Badge>
                {flag.types.map((type) => (
                  <Badge key={type} variant="outline" className={typeConfig[type].className}>
                    {typeConfig[type].label}
                  </Badge>
                ))}
                <span className="text-sm text-muted-foreground ml-auto">{flag.timestamp}</span>
              </div>
            )}

            {/* Scores */}
            <div className="grid grid-cols-3 gap-6 mb-6">
              {flag.aiScore !== undefined && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">AI Detection Score</p>
                  <div className="flex items-center gap-2">
                    <Progress value={flag.aiScore} className="flex-1 h-3" />
                    <span className={`text-xl font-bold ${flag.aiScore > 70 ? 'text-destructive' : flag.aiScore > 40 ? 'text-warning' : 'text-success'}`}>
                      {flag.aiScore}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">GPTZero confidence</p>
                </div>
              )}

              {flag.plagiarismScore !== undefined && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Plagiarism Score</p>
                  <div className="flex items-center gap-2">
                    <Progress value={flag.plagiarismScore} className="flex-1 h-3" />
                    <span className={`text-xl font-bold ${flag.plagiarismScore > 50 ? 'text-pink-600' : 'text-success'}`}>
                      {flag.plagiarismScore}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Web source match</p>
                </div>
              )}

              {flag.pasteSize !== undefined && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Paste Size</p>
                  <p className="text-2xl font-bold text-foreground">{flag.pasteSize}</p>
                  <p className="text-xs text-muted-foreground mt-1">characters pasted</p>
                </div>
              )}
            </div>

            {/* Content Preview */}
            <div className="bg-muted/50 rounded-lg p-4 border border-border mb-4">
              <p className="text-xs text-muted-foreground mb-2 font-semibold">Flagged Content:</p>
              <p className="text-sm text-foreground italic">"{flag.contentPreview}"</p>
            </div>

            {/* Plagiarism Source */}
            {flag.sourceUrl && (
              <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4 border border-pink-200 dark:border-pink-800 mb-4">
                <p className="text-xs text-pink-800 dark:text-pink-300 mb-2 font-semibold flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Plagiarism Source Detected:
                </p>
                <a href={flag.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                  {flag.sourceUrl}
                </a>
                <p className="text-xs text-muted-foreground mt-1">{flag.plagiarismScore}% similarity to source content</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button className="flex-1 bg-success hover:bg-success/90">
                <Check className="w-5 h-5 mr-2" />
                Confirm & Document
              </Button>
              <Button variant="outline" className="flex-1 border-warning text-warning hover:bg-warning/10">
                <MoreHorizontal className="w-5 h-5 mr-2" />
                Mark for Further Review
              </Button>
              <Button variant="outline" className="flex-1">
                <X className="w-5 h-5 mr-2" />
                Dismiss as False Positive
              </Button>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                View in Timeline
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Flags() {
  const [activeTab, setActiveTab] = useState("pending");
  const [project, setProject] = useState("all");

  const filteredFlags = mockFlags.filter((flag) => {
    if (activeTab === "pending") return flag.status === "pending";
    if (activeTab === "confirmed") return flag.status === "confirmed";
    if (activeTab === "dismissed") return flag.status === "dismissed";
    return true;
  });

  return (
    <TeacherLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <Flag className="w-8 h-8 text-destructive" />
                  Flags & Academic Integrity Alerts
                </h1>
                <p className="text-muted-foreground">Review AI detections, plagiarism, and suspicious activity</p>
              </div>

              <div className="flex items-center gap-3">
                <Select value={project} onValueChange={setProject}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    <SelectItem value="cs101">CS 101 Final Project</SelectItem>
                    <SelectItem value="math250">MATH 250 Midterm</SelectItem>
                  </SelectContent>
                </Select>
                <Button>Export Report</Button>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="pending" className="flex items-center gap-2">
                  Pending Review
                  <Badge variant="destructive" className="ml-1">7</Badge>
                </TabsTrigger>
                <TabsTrigger value="confirmed">Confirmed (12)</TabsTrigger>
                <TabsTrigger value="dismissed">Dismissed (5)</TabsTrigger>
                <TabsTrigger value="all">All Flags (24)</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="High Severity"
              value={3}
              subtitle="Needs immediate review"
              icon={<AlertTriangle className="w-6 h-6 text-destructive" />}
              borderColor="border-destructive"
              iconBgColor="bg-destructive/10"
            />
            <StatCard
              title="AI Detected"
              value={5}
              subtitle="GPTZero confidence >80%"
              icon={<Shield className="w-6 h-6 text-purple-600" />}
              borderColor="border-purple-500"
              iconBgColor="bg-purple-100 dark:bg-purple-900/30"
            />
            <StatCard
              title="Plagiarism"
              value={2}
              subtitle="Web source matches"
              icon={<Copy className="w-6 h-6 text-pink-600" />}
              borderColor="border-pink-500"
              iconBgColor="bg-pink-100 dark:bg-pink-900/30"
            />
            <StatCard
              title="Large Pastes"
              value={4}
              subtitle="Suspicious paste events"
              icon={<FileText className="w-6 h-6 text-warning" />}
              borderColor="border-warning"
              iconBgColor="bg-warning/10"
            />
          </div>

          {/* Filters */}
          <div className="bg-card rounded-xl shadow-soft p-4 mb-6 border border-border">
            <div className="flex items-center gap-4">
              <p className="text-sm font-semibold text-muted-foreground">Filter:</p>
              <Button variant="outline" size="sm" className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">
                High Severity
              </Button>
              <Button variant="outline" size="sm" className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700">
                AI Detection
              </Button>
              <Button variant="outline" size="sm" className="bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700">
                Plagiarism
              </Button>
              <Button variant="outline" size="sm" className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/20">
                Large Pastes
              </Button>
              <div className="ml-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search flags..." className="pl-9 w-64" />
                </div>
              </div>
            </div>
          </div>

          {/* Flag Cards */}
          <div className="space-y-4">
            {filteredFlags.map((flag) => (
              <FlagCard key={flag.id} flag={flag} />
            ))}
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
