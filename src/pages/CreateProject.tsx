import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Info,
  Mail,
  Upload,
  Link2,
  Trash2,
  Plus,
  FileText,
  FolderOpen,
  Github,
  Video,
  MessageSquare,
  Hash,
  FileEdit,
  Globe,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const steps = [
  { number: 1, title: "Project Details", description: "Basic information" },
  { number: 2, title: "Tracking URLs", description: "Where students work" },
  { number: 3, title: "Add Students", description: "Invite participants" },
];

const platformOptions = [
  { value: "google_docs", label: "Google Docs", icon: FileText },
  { value: "google_drive", label: "Google Drive Folder", icon: FolderOpen },
  { value: "github", label: "GitHub Repository", icon: Github },
  { value: "zoom", label: "Zoom Meeting Room", icon: Video },
  { value: "slack", label: "Slack Channel", icon: MessageSquare },
  { value: "discord", label: "Discord Server", icon: Hash },
  { value: "notion", label: "Notion Page", icon: FileEdit },
  { value: "other", label: "Other Website", icon: Globe },
];

export default function CreateProject() {
  const [currentStep, setCurrentStep] = useState(1);
  const [urls, setUrls] = useState([{ id: 1, platform: "google_docs", url: "" }]);

  const addUrl = () => {
    setUrls([...urls, { id: Date.now(), platform: "google_docs", url: "" }]);
  };

  const removeUrl = (id: number) => {
    setUrls(urls.filter((u) => u.id !== id));
  };

  const updateUrl = (id: number, field: "platform" | "url", value: string) => {
    setUrls(urls.map((u) => (u.id === id ? { ...u, [field]: value } : u)));
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Create New Project</h1>
          <p className="text-muted-foreground">
            Set up tracking for your group project in 3 steps
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    currentStep > step.number
                      ? "bg-success text-success-foreground"
                      : currentStep === step.number
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="hidden sm:block">
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.number
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.number ? "bg-success" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </motion.div>

        {/* Step 1: Project Details */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-xl border border-border shadow-soft p-8"
          >
            <h2 className="text-xl font-bold mb-6">Step 1: Project Details</h2>

            <div className="space-y-6">
              <div>
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., CS 101 Final Project"
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Give your project a descriptive name
                </p>
              </div>

              <div>
                <Label htmlFor="course">Course Name *</Label>
                <Input
                  id="course"
                  placeholder="e.g., Computer Science 101"
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="deadline">Deadline *</Label>
                  <Input id="deadline" type="date" className="mt-2" />
                </div>

                <div>
                  <Label htmlFor="groupSize">Group Size</Label>
                  <Select defaultValue="4">
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 students per group</SelectItem>
                      <SelectItem value="3">3 students per group</SelectItem>
                      <SelectItem value="4">4 students per group</SelectItem>
                      <SelectItem value="5">5 students per group</SelectItem>
                      <SelectItem value="6">6 students per group</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the project..."
                  className="mt-2"
                  rows={3}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Tracking URLs */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-xl border border-border shadow-soft p-8"
          >
            <h2 className="text-xl font-bold mb-2">Step 2: Where Will Students Work?</h2>
            <p className="text-muted-foreground mb-6">
              Add URLs for documents, repos, or channels students will use. The extension
              will <strong className="text-foreground">ONLY</strong> track activity on
              these specific URLs.
            </p>

            {/* Privacy Alert */}
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    Privacy by Design
                  </p>
                  <p className="text-sm text-muted-foreground">
                    The extension will NOT track personal browsing. It only monitors the
                    specific URLs you add below. Students can see exactly what's being
                    tracked.
                  </p>
                </div>
              </div>
            </div>

            {/* URL Entries */}
            <div className="space-y-4 mb-4">
              {urls.map((urlEntry) => (
                <div
                  key={urlEntry.id}
                  className="border-2 border-border rounded-lg p-4 hover:border-primary/30 transition-colors"
                >
                  <div className="flex flex-col md:flex-row items-start gap-4">
                    <div className="w-full md:w-56 flex-shrink-0">
                      <Select
                        value={urlEntry.platform}
                        onValueChange={(v) => updateUrl(urlEntry.id, "platform", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {platformOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <div className="flex items-center gap-2">
                                <opt.icon className="h-4 w-4" />
                                {opt.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1 w-full">
                      <Input
                        type="url"
                        placeholder="Paste URL here (e.g., https://docs.google.com/document/d/abc123...)"
                        value={urlEntry.url}
                        onChange={(e) => updateUrl(urlEntry.id, "url", e.target.value)}
                      />
                      <p className="text-xs text-success mt-1">
                        ✓ Extension will track activity when students are on this URL
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeUrl(urlEntry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add URL Button */}
            <button
              onClick={addUrl}
              className="w-full border-2 border-dashed border-border rounded-lg py-4 text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add Another URL
            </button>

            {/* Example URLs */}
            <div className="mt-6 bg-muted/50 rounded-lg p-5 border border-border">
              <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Example URLs:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>
                  <strong>Google Doc:</strong> https://docs.google.com/document/d/1a2b3c...
                </li>
                <li>
                  <strong>Shared Drive:</strong> https://drive.google.com/drive/folders/xyz...
                </li>
                <li>
                  <strong>GitHub:</strong> https://github.com/username/repo-name
                </li>
                <li>
                  <strong>Slack:</strong> https://teamname.slack.com/archives/C01ABC123
                </li>
              </ul>
            </div>
          </motion.div>
        )}

        {/* Step 3: Add Students */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-xl border border-border shadow-soft p-8"
          >
            <h2 className="text-xl font-bold mb-6">Step 3: Add Students</h2>

            {/* Import Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button className="flex flex-col items-center gap-2 border-2 border-primary bg-primary/5 text-primary py-4 rounded-lg font-semibold hover:bg-primary/10 transition">
                <Mail className="h-6 w-6" />
                Paste Email List
              </button>

              <button className="flex flex-col items-center gap-2 border-2 border-border py-4 rounded-lg font-semibold hover:border-primary hover:bg-primary/5 transition text-foreground">
                <Upload className="h-6 w-6" />
                Upload CSV
              </button>

              <button className="flex flex-col items-center gap-2 border-2 border-border py-4 rounded-lg font-semibold hover:border-primary hover:bg-primary/5 transition text-foreground">
                <Link2 className="h-6 w-6" />
                Import from LMS
              </button>
            </div>

            {/* Email Input */}
            <div>
              <Label htmlFor="emails">Student Emails (one per line)</Label>
              <Textarea
                id="emails"
                rows={10}
                placeholder="alice@school.edu&#10;bob@school.edu&#10;charlie@school.edu&#10;david@school.edu"
                className="mt-2 font-mono text-sm"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Enter one email address per line</span>
                <span>0 students added</span>
              </div>
            </div>

            {/* What Happens Next */}
            <div className="mt-6 bg-success/5 border border-success/20 rounded-lg p-4">
              <div className="flex gap-3">
                <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">
                    What happens next?
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>
                      ✓ Students will receive email invitations to install the FairGrade
                      extension
                    </li>
                    <li>
                      ✓ Extension auto-configures with this project's tracking URLs
                    </li>
                    <li>
                      ✓ Tracking begins automatically when they work on project
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-8">
          <Button variant="ghost" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Link>
          </Button>

          <div className="flex items-center gap-3">
            {currentStep > 1 && (
              <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}

            {currentStep < 3 ? (
              <Button onClick={() => setCurrentStep(currentStep + 1)}>
                Next Step
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button className="bg-success hover:bg-success/90">
                Create Project & Send Invites
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
