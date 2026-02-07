import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  X,
  ArrowLeft,
  ArrowRight,
  Check,
  Trash2,
  Copy,
  Upload,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface CreateProjectWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Course {
  id: string;
  name: string;
  code: string;
}

interface AddedStudent {
  id: string;
  email: string;
  name?: string;
  role: "member" | "lead";
}

// 2-step wizard: Details → Students (Files step removed)
const steps = [
  { number: 1, title: "Details", description: "Project information" },
  { number: 2, title: "Students", description: "Add participants" },
];

export function CreateProjectWizard({ isOpen, onClose }: CreateProjectWizardProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Details
  const [projectName, setProjectName] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [teamSize, setTeamSize] = useState("4");
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");

  // FairScore Weights
  const [weights, setWeights] = useState({
    work: 35,
    collaboration: 25,
    consistency: 20,
    peerRating: 15,
    integrity: 5,
  });

  // LMS Integration
  const [lmsType, setLmsType] = useState("none");
  const [lmsCourseId, setLmsCourseId] = useState("");

  // Step 2: Students
  const [studentEmail, setStudentEmail] = useState("");
  const [addedStudents, setAddedStudents] = useState<AddedStudent[]>([]);
  const [inviteCode, setInviteCode] = useState("");
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  // Load courses
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoadingCourses(true);
      try {
        // TODO: GET http://localhost:8000/api/teacher/courses
        // const response = await fetch('http://localhost:8000/api/teacher/courses');
        // const data = await response.json();
        // setCourses(data);
        
        await new Promise(resolve => setTimeout(resolve, 300));
        setCourses([]);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setIsLoadingCourses(false);
      }
    };
    if (isOpen) fetchCourses();
  }, [isOpen]);

  const totalWeight = weights.work + weights.collaboration + weights.consistency + weights.peerRating + weights.integrity;
  const isWeightsValid = totalWeight === 100;

  const canProceedStep1 = projectName.trim() !== "" && isWeightsValid;
  const canSubmit = projectName.trim() !== "";

  const handleAddCourse = async () => {
    if (!newCourseName.trim()) return;
    try {
      // TODO: POST http://localhost:8000/api/teacher/courses
      // const response = await fetch('http://localhost:8000/api/teacher/courses', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name: newCourseName, code: newCourseCode })
      // });
      // const newCourse = await response.json();
      // setCourses([...courses, newCourse]);
      // setSelectedCourse(newCourse.id);
      
      const newCourse = { id: Date.now().toString(), name: newCourseName, code: newCourseCode };
      setCourses([...courses, newCourse]);
      setSelectedCourse(newCourse.id);
      setNewCourseName("");
      setNewCourseCode("");
      setShowAddCourse(false);
    } catch (error) {
      console.error("Failed to add course:", error);
    }
  };

  const handleAddStudent = () => {
    if (!studentEmail.trim()) return;
    if (addedStudents.some(s => s.email === studentEmail.trim())) {
      toast({ title: "Student already added", variant: "destructive" });
      return;
    }
    // TODO: POST http://localhost:8000/api/projects/{project_id}/invite
    setAddedStudents([...addedStudents, {
      id: Date.now().toString(),
      email: studentEmail.trim(),
      role: "member",
    }]);
    setStudentEmail("");
  };

  const handleRemoveStudent = (id: string) => {
    setAddedStudents(addedStudents.filter(s => s.id !== id));
  };

  const handleGenerateCode = async () => {
    setIsGeneratingCode(true);
    try {
      // TODO: POST http://localhost:8000/api/projects/{project_id}/generate-code
      // const response = await fetch('http://localhost:8000/api/projects/{project_id}/generate-code', { method: 'POST' });
      // const data = await response.json();
      // setInviteCode(data.invite_code);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setInviteCode(code);
    } catch (error) {
      console.error("Failed to generate code:", error);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast({ title: "Invite code copied!" });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // TODO: POST http://localhost:8000/api/projects
      // const response = await fetch('http://localhost:8000/api/projects', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name: projectName,
      //     course_id: selectedCourse,
      //     description,
      //     deadline,
      //     team_size: parseInt(teamSize),
      //     weights: {
      //       work: weights.work,
      //       collaboration: weights.collaboration,
      //       consistency: weights.consistency,
      //       peer_rating: weights.peerRating,
      //       integrity: weights.integrity,
      //     },
      //     lms: lmsType !== 'none' ? { type: lmsType, course_id: lmsCourseId } : null,
      //     students: addedStudents.map(s => ({ email: s.email, role: s.role })),
      //   })
      // });
      // const newProject = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "✅ Project created successfully!",
        description: "Students will be notified.",
        className: "bg-green-500/15 border border-green-500/30 text-green-400",
      });
      
      onClose();
      // navigate(`/teacher/projects/${newProject.id}`);
    } catch (error) {
      console.error("Failed to create project:", error);
      toast({ title: "Failed to create project", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setProjectName("");
    setSelectedCourse("");
    setDescription("");
    setDeadline("");
    setTeamSize("4");
    setWeights({ work: 35, collaboration: 25, consistency: 20, peerRating: 15, integrity: 5 });
    setLmsType("none");
    setLmsCourseId("");
    setAddedStudents([]);
    setInviteCode("");
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
            className="bg-[#1e293b] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Create New Project</h2>
              <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Progress Steps - 2 steps only */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                        currentStep > step.number
                          ? "bg-green-500 text-white"
                          : currentStep === step.number
                          ? "bg-blue-500 text-white"
                          : "bg-white/10 text-slate-500"
                      }`}
                    >
                      {currentStep > step.number ? <Check className="h-4 w-4" /> : step.number}
                    </div>
                    <div className="hidden sm:block">
                      <p className={`text-sm font-medium ${currentStep >= step.number ? "text-white" : "text-slate-500"}`}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${currentStep > step.number ? "bg-green-500" : "bg-white/10"}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="p-6">
              {/* Step 1: Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-white text-sm font-medium">Project Name *</Label>
                    <Input
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Enter project name..."
                      className="mt-2 bg-white/10 border-white/10 text-white placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <Label className="text-white text-sm font-medium">Course</Label>
                    {isLoadingCourses ? (
                      <div className="mt-2 h-10 bg-white/10 animate-pulse rounded-md" />
                    ) : (
                      <>
                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                          <SelectTrigger className="mt-2 bg-white/10 border-white/10 text-white">
                            <SelectValue placeholder="Select a course..." />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.length === 0 ? (
                              <div className="p-2 text-slate-400 text-sm">No courses found</div>
                            ) : (
                              courses.map((course) => (
                                <SelectItem key={course.id} value={course.id}>
                                  {course.name} ({course.code})
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {!showAddCourse ? (
                          <button
                            onClick={() => setShowAddCourse(true)}
                            className="text-blue-400 text-sm mt-2 hover:text-blue-300"
                          >
                            + Create Course
                          </button>
                        ) : (
                          <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10 space-y-2">
                            <Input
                              value={newCourseName}
                              onChange={(e) => setNewCourseName(e.target.value)}
                              placeholder="Course name"
                              className="bg-white/10 border-white/10 text-white placeholder:text-slate-500"
                            />
                            <Input
                              value={newCourseCode}
                              onChange={(e) => setNewCourseCode(e.target.value)}
                              placeholder="Course code (e.g., CS101)"
                              className="bg-white/10 border-white/10 text-white placeholder:text-slate-500"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleAddCourse} className="bg-blue-500 hover:bg-blue-600">Add</Button>
                              <Button size="sm" variant="ghost" onClick={() => setShowAddCourse(false)}>Cancel</Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div>
                    <Label className="text-white text-sm font-medium">Description (Optional)</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the project objectives..."
                      className="mt-2 bg-white/10 border-white/10 text-white placeholder:text-slate-500"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white text-sm font-medium">Deadline</Label>
                      <Input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="mt-2 bg-white/10 border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white text-sm font-medium">Team Size</Label>
                      <Select value={teamSize} onValueChange={setTeamSize}>
                        <SelectTrigger className="mt-2 bg-white/10 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((size) => (
                            <SelectItem key={size} value={size.toString()}>
                              {size} students
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* FairScore Weights */}
                  <div className="pt-4 border-t border-white/10">
                    <Label className="text-white text-sm font-medium">Grading Weights</Label>
                    <p className="text-slate-500 text-xs mt-1 mb-4">
                      Adjust how much each factor contributes to the FairScore
                    </p>
                    
                    <div className="space-y-4">
                      {[
                        { key: "work", label: "Work Output" },
                        { key: "collaboration", label: "Collaboration" },
                        { key: "consistency", label: "Consistency" },
                        { key: "peerRating", label: "Peer Rating" },
                        { key: "integrity", label: "Integrity" },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-4">
                          <span className="text-slate-300 text-sm w-28">{label}</span>
                          <div className="flex-1">
                            <Slider
                              value={[weights[key as keyof typeof weights]]}
                              onValueChange={(value) => setWeights({ ...weights, [key]: value[0] })}
                              max={100}
                              step={5}
                              className="w-full"
                            />
                          </div>
                          <span className="text-white text-sm font-medium w-12 text-right">
                            {weights[key as keyof typeof weights]}%
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className={`mt-4 text-sm ${isWeightsValid ? "text-slate-300" : "text-red-400"}`}>
                      {isWeightsValid ? (
                        `Total: ${totalWeight}%`
                      ) : (
                        `⚠ Weights must add up to 100% (currently ${totalWeight}%)`
                      )}
                    </div>
                  </div>

                  {/* LMS Integration */}
                  <div className="pt-4 border-t border-white/10">
                    <Label className="text-white text-sm font-medium">Connect to LMS</Label>
                    <p className="text-slate-500 text-xs mt-1 mb-3">
                      Optional — sync student roster from your LMS
                    </p>
                    <Select value={lmsType} onValueChange={setLmsType}>
                      <SelectTrigger className="bg-white/10 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="canvas">Canvas</SelectItem>
                        <SelectItem value="blackboard">Blackboard</SelectItem>
                        <SelectItem value="moodle">Moodle</SelectItem>
                      </SelectContent>
                    </Select>
                    {lmsType !== "none" && (
                      <Input
                        value={lmsCourseId}
                        onChange={(e) => setLmsCourseId(e.target.value)}
                        placeholder="Course ID"
                        className="mt-2 bg-white/10 border-white/10 text-white placeholder:text-slate-500"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Students */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* Add by Email */}
                  <div>
                    <Label className="text-white text-sm font-medium">Add by Email</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        placeholder="Enter student email..."
                        className="flex-1 bg-white/10 border-white/10 text-white placeholder:text-slate-500"
                        onKeyDown={(e) => e.key === "Enter" && handleAddStudent()}
                      />
                      <Button onClick={handleAddStudent} className="bg-blue-500 hover:bg-blue-600">
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Invite Code */}
                  <div className="pt-4 border-t border-white/10">
                    <Label className="text-white text-sm font-medium">Or share this invite code with your students</Label>
                    <div className="mt-3 text-center p-4 bg-white/10 border border-white/10 rounded-xl">
                      {inviteCode ? (
                        <>
                          <p className="text-white font-mono text-2xl tracking-widest">{inviteCode}</p>
                          <Button onClick={handleCopyCode} variant="ghost" size="sm" className="mt-2 text-blue-400">
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Code
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="text-slate-500 font-mono text-2xl tracking-widest">——————</p>
                          <Button
                            onClick={handleGenerateCode}
                            disabled={isGeneratingCode}
                            className="mt-2 bg-blue-500/15 text-blue-400 hover:bg-blue-500/25"
                          >
                            {isGeneratingCode ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4 mr-2" />
                            )}
                            Generate Code
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Import from LMS */}
                  {lmsType !== "none" && (
                    <div className="pt-4 border-t border-white/10">
                      <Button variant="outline" className="bg-white/10 border-white/10 text-white">
                        <Upload className="w-4 h-4 mr-2" />
                        Import Student Roster from {lmsType.charAt(0).toUpperCase() + lmsType.slice(1)}
                      </Button>
                    </div>
                  )}

                  {/* CSV Upload */}
                  <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-white/20 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">Or import from CSV</p>
                    <p className="text-slate-500 text-xs mt-1">Drag and drop or click to browse</p>
                  </div>

                  {/* Added Students List */}
                  <div>
                    <Label className="text-white text-sm font-medium">Added Students ({addedStudents.length})</Label>
                    {addedStudents.length === 0 ? (
                      <div className="mt-3 p-6 bg-white/5 rounded-xl border border-white/10 text-center">
                        <p className="text-slate-400 text-sm">
                          No students added yet. Add students by email, invite code, or import from your LMS.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-3 space-y-2">
                        {addedStudents.map((student) => (
                          <div
                            key={student.id}
                            className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                          >
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              {student.email[0].toUpperCase()}
                            </div>
                            <span className="flex-1 text-white text-sm">{student.email}</span>
                            <Select
                              value={student.role}
                              onValueChange={(value: "member" | "lead") =>
                                setAddedStudents(addedStudents.map(s =>
                                  s.id === student.id ? { ...s, role: value } : s
                                ))
                              }
                            >
                              <SelectTrigger className="w-28 bg-white/10 border-white/10 text-white text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="lead">Team Lead</SelectItem>
                              </SelectContent>
                            </Select>
                            <button
                              onClick={() => handleRemoveStudent(student.id)}
                              className="p-1 hover:bg-red-500/20 rounded text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {addedStudents.length > 0 && addedStudents.length < parseInt(teamSize) && (
                      <p className="text-slate-500 text-xs mt-2">
                        ℹ Students can still join later using the invite code
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-white/10">
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <div className="flex gap-3">
                {currentStep > 1 && (
                  <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}
                {currentStep < 2 ? (
                  <Button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={!canProceedStep1}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Next Step
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                    className="bg-blue-500 hover:bg-blue-600 px-8"
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
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
