import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Calendar,
  Edit2,
  Trash2,
  Loader2,
  X,
  Clock,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  getMyAssignments,
  getClassroomAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  formatDueDate,
  getAssignmentUrgency,
  getUrgencyStyles,
  type Assignment,
} from "@/lib/assignmentUtils";

interface Classroom {
  id: string;
  name: string;
}

interface AssignmentsSectionProps {
  classroomId?: string;
}

export function AssignmentsSection({ classroomId }: AssignmentsSectionProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formClassroomId, setFormClassroomId] = useState(classroomId || "");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDueDate, setFormDueDate] = useState("");
  const [formDueTime, setFormDueTime] = useState("23:59");

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      let data: Assignment[];
      if (classroomId) {
        // Fetch assignments for specific classroom
        data = await getClassroomAssignments(classroomId);
      } else {
        // Fetch all teacher's assignments
        data = await getMyAssignments();
      }
      setAssignments(data);
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
      setAssignments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClassrooms = async () => {
    try {
      const data = await api.get<Classroom[]>("/api/classrooms");
      setClassrooms(Array.isArray(data) ? data : []);
      // Auto-select first classroom if only one
      if (Array.isArray(data) && data.length === 1) {
        setFormClassroomId(String(data[0].id));
      }
    } catch (error) {
      console.error("Failed to fetch classrooms:", error);
      setClassrooms([]);
    }
  };

  useEffect(() => {
    fetchAssignments();
    if (!classroomId) {
      fetchClassrooms();
    }
  }, [classroomId]);

  const resetForm = () => {
    setFormClassroomId(classroomId || "");
    setFormTitle("");
    setFormDescription("");
    setFormDueDate("");
    setFormDueTime("23:59");
    setEditingAssignment(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setFormClassroomId(String(assignment.classroom_id));
    setFormTitle(assignment.title);
    setFormDescription(assignment.description || "");
    const dueDate = new Date(assignment.due_date);
    setFormDueDate(dueDate.toISOString().split("T")[0]);
    setFormDueTime(dueDate.toTimeString().slice(0, 5));
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!formTitle.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!formClassroomId && !classroomId) {
      toast.error("Please select a classroom");
      return;
    }
    if (!formDueDate) {
      toast.error("Please select a due date");
      return;
    }

    setIsSubmitting(true);
    const dueDateISO = `${formDueDate}T${formDueTime}:00Z`;

    try {
      if (editingAssignment) {
        // Update existing assignment
        await updateAssignment(editingAssignment.id, {
          title: formTitle,
          description: formDescription,
          due_date: dueDateISO,
        });
        toast.success("Assignment updated!");
      } else {
        // Create new assignment
        await createAssignment({
          classroom_id: classroomId || formClassroomId,
          title: formTitle,
          description: formDescription,
          due_date: dueDateISO,
        });
        toast.success("Assignment created!");
      }
      closeModal();
      await fetchAssignments();
    } catch (error) {
      console.error("Failed to save assignment:", error);
      toast.error(editingAssignment ? "Failed to update assignment" : "Failed to create assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (assignmentId: string | number) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;

    try {
      await deleteAssignment(assignmentId);
      toast.success("Assignment deleted");
      await fetchAssignments();
    } catch (error) {
      console.error("Failed to delete assignment:", error);
      toast.error("Failed to delete assignment");
    }
  };

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-blue-400" />
          <div>
            <h2 className="text-lg font-semibold text-white">Assignments</h2>
            <p className="text-sm text-slate-400">
              Deadlines and milestones for your students
            </p>
          </div>
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Assignment
        </Button>
      </div>

      {/* Assignments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
        </div>
      ) : assignments.length > 0 ? (
        <div className="space-y-3">
          {assignments.map((assignment, index) => {
            const urgency = getAssignmentUrgency(assignment);
            const urgencyStyles = getUrgencyStyles(urgency);
            return (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-xl border-l-2 ${urgencyStyles.border} bg-white/[0.03] hover:bg-white/[0.05] transition-colors`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium truncate">{assignment.title}</h3>
                      {assignment.classroom_name && (
                        <span className="bg-white/10 text-slate-400 text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                          {assignment.classroom_name}
                        </span>
                      )}
                    </div>
                    {assignment.description && (
                      <p className="text-slate-400 text-sm mb-2 line-clamp-2">
                        {assignment.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1 text-xs ${urgencyStyles.text}`}>
                        <Clock className="w-3 h-3" />
                        {formatDueDate(assignment.due_date)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => openEditModal(assignment)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(assignment.id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No assignments yet</p>
          <p className="text-slate-500 text-sm mt-1">
            Create your first assignment to set deadlines for your students
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">
                {editingAssignment ? "Edit Assignment" : "Create Assignment"}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Classroom Selection (only if no classroomId prop) */}
            {!classroomId && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Classroom
                </label>
                <select
                  value={formClassroomId}
                  onChange={(e) => setFormClassroomId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                  disabled={!!editingAssignment}
                >
                  <option value="">Select a classroom...</option>
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Title
              </label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g., Research Paper Draft Due"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description (optional)
              </label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Details about what's due..."
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 min-h-[80px]"
              />
            </div>

            {/* Due Date & Time */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Due Date
                </label>
                <Input
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Due Time
                </label>
                <Input
                  type="time"
                  value={formDueTime}
                  onChange={(e) => setFormDueTime(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-blue-500 hover:bg-blue-600 py-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editingAssignment ? "Updating..." : "Creating..."}
                </>
              ) : editingAssignment ? (
                "Update Assignment"
              ) : (
                "Create Assignment"
              )}
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
