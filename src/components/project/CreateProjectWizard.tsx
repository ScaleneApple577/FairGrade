import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Loader2 } from "lucide-react";
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
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface CreateProjectWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Classroom {
  id: number | string;
  name: string;
}

export function CreateProjectWizard({ isOpen, onClose }: CreateProjectWizardProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState("");
  const [isLoadingClassrooms, setIsLoadingClassrooms] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const fetchClassrooms = async () => {
      setIsLoadingClassrooms(true);
      try {
        const data = await api.get<Classroom[]>('/api/classrooms');
        setClassrooms(data || []);
        // Auto-select if only one
        if (data && data.length === 1) {
          setSelectedClassroom(String(data[0].id));
        }
      } catch (error) {
        console.error("Failed to fetch classrooms:", error);
        setClassrooms([]);
      } finally {
        setIsLoadingClassrooms(false);
      }
    };
    fetchClassrooms();
  }, [isOpen]);

  const canSubmit = projectName.trim() !== "";

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.post<{ id: string; name: string; description: string | null; created_at: string }>('/api/projects', {
        name: projectName,
        description: description || '',
      });

      toast({
        title: "✅ Project created!",
        className: "bg-green-500/15 border border-green-500/30 text-green-400",
      });

      handleClose();
      navigate(`/teacher/projects/${response.id}`);
    } catch (error) {
      console.error("Failed to create project:", error);
      toast({ title: "Failed to create project.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setProjectName("");
    setDescription("");
    setSelectedClassroom("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto"
        onClick={handleClose}
      >
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#1e293b] border border-white/10 rounded-2xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Create New Project</h2>
              <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-5">
              {/* Project Name */}
              <div>
                <Label className="text-white text-sm font-medium">Project Name *</Label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g., CS 101 Final Project"
                  className="mt-2 bg-white/10 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>

              {/* Description */}
              <div>
                <Label className="text-white text-sm font-medium">Description (optional)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the project..."
                  className="mt-2 bg-white/10 border-white/10 text-white placeholder:text-slate-500"
                  rows={3}
                />
              </div>

              {/* Classroom */}
              <div>
                <Label className="text-white text-sm font-medium">Classroom *</Label>
                {isLoadingClassrooms ? (
                  <div className="mt-2 h-10 bg-white/10 animate-pulse rounded-md" />
                ) : classrooms.length === 0 ? (
                  <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-sm text-yellow-400">
                    No classrooms found. Create a classroom first from the Students page.
                  </div>
                ) : (
                  <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
                    <SelectTrigger className="mt-2 bg-white/10 border-white/10 text-white">
                      <SelectValue placeholder="Select a classroom..." />
                    </SelectTrigger>
                    <SelectContent>
                      {classrooms.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Submit */}
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Project"
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
