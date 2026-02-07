import { useState, useRef } from "react";
import { Upload, FileText, Loader2, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface ImportCSVModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface CSVPreview {
  fileName: string;
  fileSize: string;
  emailCount: number;
  previewEmails: string[];
}

export function ImportCSVModal({
  open,
  onOpenChange,
  onSuccess,
}: ImportCSVModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CSVPreview | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const parseCSV = async (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split(/\r?\n/).filter((line) => line.trim());
        
        // Find email column
        const headers = lines[0].toLowerCase().split(",").map((h) => h.trim());
        const emailIndex = headers.findIndex(
          (h) => h === "email" || h.includes("email")
        );

        if (emailIndex === -1) {
          reject(new Error("No 'email' column found in CSV"));
          return;
        }

        const emails: string[] = [];
        for (let i = 1; i < lines.length; i++) {
          const columns = lines[i].split(",");
          const email = columns[emailIndex]?.trim().toLowerCase();
          if (email && email.includes("@")) {
            emails.push(email);
          }
        }

        resolve(emails);
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".csv")) {
      toast.error("Please select a CSV file");
      return;
    }

    setFile(selectedFile);

    try {
      const emails = await parseCSV(selectedFile);
      setPreview({
        fileName: selectedFile.name,
        fileSize: formatFileSize(selectedFile.size),
        emailCount: emails.length,
        previewEmails: emails.slice(0, 5),
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to parse CSV"
      );
      setFile(null);
      setPreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleImport = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      // TODO: Upload CSV file
      const result = await api.upload("/api/teacher/students/import-csv", formData);

      // Expected response: { total: number, sent: number, failed: number, already_registered: number }
      const { total, sent, failed, already_registered } = result;

      toast.success(
        `✅ Imported ${sent} students${
          already_registered > 0 ? ` (${already_registered} already registered)` : ""
        }${failed > 0 ? `. ${failed} failed.` : "."}`
      );

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Failed to import CSV:", error);
      toast.error("Failed to import CSV. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
  };

  const downloadTemplate = () => {
    const csvContent = "email,name\nstudent1@school.edu,John Smith\nstudent2@school.edu,Jane Doe\n";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_import_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-lg font-semibold">
            Import Students from CSV
          </DialogTitle>
          <p className="text-slate-400 text-sm mt-1">
            Upload a CSV file with student email addresses
          </p>
        </DialogHeader>

        <div className="mt-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) handleFileSelect(selectedFile);
            }}
            className="hidden"
          />

          {!preview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`bg-white/[0.03] border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                isDragging
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
              }`}
            >
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-300 text-sm">
                Drop your CSV file here or click to browse
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Accepted format: .csv with an 'email' column
              </p>
            </div>
          ) : (
            <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-white text-sm font-medium">
                      {preview.fileName}
                    </p>
                    <p className="text-slate-500 text-xs">{preview.fileSize}</p>
                  </div>
                </div>
                <button
                  onClick={resetForm}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-emerald-400 text-sm">
                  Found {preview.emailCount} email addresses
                </p>
                <div className="text-slate-400 text-xs space-y-0.5">
                  {preview.previewEmails.map((email, i) => (
                    <p key={i}>{email}</p>
                  ))}
                  {preview.emailCount > 5 && (
                    <p className="text-slate-500">
                      ... and {preview.emailCount - 5} more
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-400 text-xs hover:text-blue-300 mt-3"
              >
                Change file
              </button>
            </div>
          )}

          <Button
            onClick={handleImport}
            disabled={!file || isUploading}
            className="bg-blue-500 hover:bg-blue-600 text-white w-full py-2.5 rounded-xl font-medium mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Importing...
              </>
            ) : (
              "Import & Send Invitations"
            )}
          </Button>

          <button
            onClick={downloadTemplate}
            className="flex items-center justify-center gap-2 text-blue-400 text-xs hover:text-blue-300 mt-3 w-full"
          >
            <Download className="w-3 h-3" />
            Download CSV template
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
