import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import {
  FileText,
  Plus,
  ExternalLink,
  Trash2,
  X,
  Loader2,
  Info,
  CheckCircle,
  ArrowLeft,
  Calendar,
  Users,
  Clock,
} from "lucide-react";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { 
  extractDriveFileId, 
  getMimeTypeFromUrl, 
  getGoogleFileUrl, 
  getFileIcon,
  isValidGoogleUrl 
} from "@/lib/fileUtils";
import { MyTeamSection } from "@/components/project/MyTeamSection";

// Backend API response format
interface ApiProject {
  id: string;
  name: string;
  description: string | null;
  files: ApiFile[];
  created_at: string;
}

interface ApiFile {
  id: string;
  name: string;
  drive_file_id: string;
  mime_type: string;
  created_at: string;
}

// Frontend display format
interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  // Optional fields not from backend
  courseName?: string;
  deadline?: string;
  teamSize?: number;
  teammateCount?: number;
  progress?: number;
}

interface SubmittedFile {
  id: string;
  name: string;
  drive_file_id: string;
  mime_type: string;
  created_at: string;
}

export default function StudentProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<SubmittedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Create document form
  const [newDocName, setNewDocName] = useState("");
  const [newDocType, setNewDocType] = useState<"google_doc" | "google_sheet" | "google_slides">("google_doc");
  const [isCreating, setIsCreating] = useState(false);

  // Link document form
  const [linkUrl, setLinkUrl] = useState("");
  const [linkUrlError, setLinkUrlError] = useState("");
  const [isLinking, setIsLinking] = useState(false);

  // Deleting
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Backend returns: { id, name, description, files: [...], created_at }
        const data = await api.get<ApiProject>(`/api/projects/projects/${id}`);
        
        // Transform to frontend format
        setProject({
          id: data.id,
          name: data.name,
          description: data.description || '',
          created_at: data.created_at,
          courseName: '—', // Not returned by backend
          deadline: undefined,
          teamSize: undefined,
          teammateCount: undefined,
          progress: 0,
        });
        
        // Files come directly from project response
        setFiles(data.files || []);
      } catch (error) {
        console.error("Failed to fetch project:", error);
        setProject(null);
        setFiles([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const validateGoogleUrl = (url: string): boolean => {
    return isValidGoogleUrl(url);
  };

  const handleCreateDocument = async () => {
    if (!newDocName.trim()) return;
    setIsCreating(true);
    try {
      // TODO: Creating new Google files requires Google Drive API integration
      // For now, show message to create in Drive and link
      toast({
        title: "Create in Google Drive",
        description: "Please create your document in Google Drive, then paste the link to link it here.",
        className: "bg-blue-500/15 border border-blue-500/30 text-blue-400",
      });
      
      setShowCreateModal(false);
      setShowLinkModal(true);
      setNewDocName("");
      setNewDocType("google_doc");
    } catch (error) {
      console.error("Failed to create document:", error);
      toast({ title: "Failed to create document", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleLinkDocument = async () => {
    if (!linkUrl.trim()) return;
    
    if (!validateGoogleUrl(linkUrl)) {
      setLinkUrlError("Please enter a valid Google Docs, Sheets, or Slides URL");
      return;
    }
    
    // Extract drive_file_id from URL
    const driveFileId = extractDriveFileId(linkUrl);
    if (!driveFileId) {
      setLinkUrlError("Could not extract file ID from URL");
      return;
    }
    
    const mimeType = getMimeTypeFromUrl(linkUrl);
    const fileName = newDocName.trim() || 'Untitled Document';
    
    setIsLinking(true);
    setLinkUrlError("");
    try {
      // POST /api/projects/{project_id}/files
      const response = await api.post<ApiFile>(`/api/projects/projects/${id}/files`, {
        name: fileName,
        drive_file_id: driveFileId,
        mime_type: mimeType,
      });
      
      // Add to local files list
      setFiles([...files, response]);
      
      toast({
        title: "✅ Document submitted",
        description: "Your document is now being tracked by FairGrade",
        className: "bg-green-500/15 border border-green-500/30 text-green-400",
      });
      
      setShowLinkModal(false);
      setLinkUrl("");
      setNewDocName("");
    } catch (error) {
      console.error("Failed to link document:", error);
      toast({ title: "Failed to link document", variant: "destructive" });
    } finally {
      setIsLinking(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    setIsDeleting(true);
    try {
      // TODO: DELETE /api/projects/{project_id}/files/{file_id} - endpoint may not exist
      // For now, just remove locally with a warning
      console.warn("TODO: Need DELETE /api/projects/{project_id}/files/{file_id} endpoint");
      setFiles(files.filter(f => f.id !== fileId));
      
      toast({ title: "Document removed" });
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete file:", error);
      toast({ title: "Failed to remove document", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  // Use the imported getFileIcon helper
  const getFileIconForType = (mimeType: string) => {
    return getFileIcon(mimeType);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f0]">
        <StudentPageHeader backLabel="Back to Projects" backTo="/student/projects" />
        <div className="px-6 pb-6 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <StudentPageHeader backLabel="Back to Projects" backTo="/student/projects" />
      <div className="px-6 pb-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/student/projects")}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to My Projects</span>
        </button>

        {project ? (
          <>
            {/* Project Header */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">{project.name}</h1>
              <p className="text-slate-400 text-sm mb-4">{project.courseName}</p>
              
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>Due {formatDate(project.deadline)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Users className="w-4 h-4" />
                  <span>{project.teammateCount}/{project.teamSize} teammates</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>{project.progress}% complete</span>
                </div>
              </div>
            </div>

            {/* My Documents Section */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
              <div className="mb-6">
                <h2 className="text-white text-lg font-semibold">My Documents</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Submit your Google Docs for this project. Your contributions will be tracked automatically.
                </p>
              </div>

              {files.length === 0 ? (
                /* Empty State */
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 text-center">
                  <span className="text-4xl">📄</span>
                  <p className="text-white font-medium mt-2">Submit your documents to get started</p>
                  <p className="text-slate-400 text-sm mt-1">
                    Your instructor needs your Google Docs to track contributions
                  </p>
                  <div className="flex gap-4 justify-center mt-4">
                    <Button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium"
                    >
                      Create New Document
                    </Button>
                    <Button
                      onClick={() => setShowLinkModal(true)}
                      variant="outline"
                      className="bg-white/10 border-white/10 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-white/15"
                    >
                      Link Existing File
                    </Button>
                  </div>
                </div>
              ) : (
                /* Files List */
                <div className="space-y-3">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="bg-white/[0.04] border border-white/10 rounded-xl p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getFileIconForType(file.mime_type)}</span>
                        <div>
                          <p className="text-white font-medium">{file.name}</p>
                          <p className="text-slate-500 text-xs">Submitted {formatDate(file.created_at)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-emerald-400 text-xs flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Being tracked by FairGrade
                        </span>
                        <Button
                          onClick={() => window.open(getGoogleFileUrl(file.drive_file_id, file.mime_type), "_blank")}
                          className="bg-blue-500/15 text-blue-400 px-4 py-2 rounded-lg text-sm hover:bg-blue-500/25"
                        >
                          Open in Google Docs
                          <ExternalLink className="w-3 h-3 ml-2" />
                        </Button>
                        <button
                          onClick={() => setShowDeleteConfirm(file.id)}
                          className="text-red-400 text-xs hover:text-red-300 ml-3"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add Another Button */}
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full bg-white/10 border border-white/10 border-dashed text-slate-400 hover:text-white hover:border-white/20 rounded-xl p-3 text-center text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Add Another Document
                  </button>
                </div>
              )}

              {/* Permission Info */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 mt-4">
                <p className="text-slate-500 text-xs flex items-start gap-2">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  By submitting, your instructor will have view access to this document and FairGrade will track edits and contributions.
                </p>
              </div>
            </div>

            {/* My Team Section */}
            <MyTeamSection projectId={project.id} />
          </>
        ) : (
          /* Project Not Found */
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-16 text-center">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Project not found</h2>
            <p className="text-slate-400 mb-6">This project may not exist or you don't have access</p>
            <Button
              onClick={() => navigate("/student/projects")}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Back to My Projects
            </Button>
          </div>
        )}
      </div>

      {/* Create New Document Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-lg font-semibold">Create New Document</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-white text-sm font-medium">Document Name</Label>
                <Input
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="e.g., Research Report"
                  className="mt-2 bg-white/10 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>

              <div>
                <Label className="text-white text-sm font-medium mb-3 block">Document Type</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { type: "google_doc", icon: "📄", label: "Google Doc", desc: "for reports, essays" },
                    { type: "google_sheet", icon: "📊", label: "Google Sheet", desc: "for data, calculations" },
                    { type: "google_slides", icon: "📽", label: "Google Slides", desc: "for presentations" },
                  ].map((option) => (
                    <button
                      key={option.type}
                      onClick={() => setNewDocType(option.type as any)}
                      className={`p-4 rounded-xl text-center transition-colors ${
                        newDocType === option.type
                          ? "border-blue-500 bg-blue-500/10 border"
                          : "border-white/10 bg-white/[0.04] hover:bg-white/[0.06] border"
                      }`}
                    >
                      <span className="text-2xl">{option.icon}</span>
                      <p className={`text-sm font-medium mt-2 ${newDocType === option.type ? "text-blue-400" : "text-white"}`}>
                        {option.label}
                      </p>
                      <p className="text-slate-500 text-xs mt-1">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleCreateDocument}
                disabled={!newDocName.trim() || isCreating}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl mt-4"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create & Submit"
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Link Existing File Modal */}
      {showLinkModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowLinkModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-lg font-semibold">Link Existing Document</h3>
              <button onClick={() => setShowLinkModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-white text-sm font-medium">Document URL</Label>
                <Input
                  value={linkUrl}
                  onChange={(e) => {
                    setLinkUrl(e.target.value);
                    setLinkUrlError("");
                  }}
                  placeholder="Paste your Google Docs/Sheets/Slides URL..."
                  className="mt-2 bg-white/10 border-white/10 text-white placeholder:text-slate-500 font-mono text-sm"
                />
                {linkUrlError && (
                  <p className="text-red-400 text-xs mt-2">{linkUrlError}</p>
                )}
              </div>

              <Button
                onClick={handleLinkDocument}
                disabled={!linkUrl.trim() || isLinking}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl mt-4"
              >
                {isLinking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Document"
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDeleteConfirm(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white text-lg font-semibold mb-2">Remove Document?</h3>
            <p className="text-slate-400 text-sm mb-6">
              This will stop tracking this document. You can add it back later.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowDeleteConfirm(null)}
                variant="outline"
                className="flex-1 bg-white/10 border-white/10 text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteFile(showDeleteConfirm)}
                disabled={isDeleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Remove"
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
