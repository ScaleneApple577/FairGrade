import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Clock, CheckCircle, Lock, Loader2 } from "lucide-react";
import { StudentLayout } from "@/components/student/StudentLayout";
import { ClassroomGate } from "@/components/student/ClassroomGate";
import { PendingReviewCard } from "@/components/reviews/PendingReviewCard";
import { SubmittedReviewCard } from "@/components/reviews/SubmittedReviewCard";
import { ReviewModal } from "@/components/reviews/ReviewModal";

// TODO: Connect to GET /api/peer-reviews/pending — peer reviews API
// TODO: Connect to GET /api/peer-reviews/submitted — peer reviews API
// TODO: Connect to POST /api/peer-reviews — submit peer review
// 
// TODO: When teams API is available, use GET /api/teams/{team_id}/members
// to get the list of teammates for peer review instead of project students.
// This enables proper team-based review workflows.

interface PendingReview {
  id: string;
  projectName: string;
  deadline: string;
  daysUntilDue: number;
  teammates: Array<{ id: string; name: string; avatar: string; role: string; color: string; reviewed: boolean }>;
  completedCount: number;
  totalCount: number;
}

interface SubmittedReview {
  id: string;
  teammateName: string;
  teammateAvatar: string;
  teammateColor: string;
  projectName: string;
  rating: number;
  feedback: string;
  submittedAt: string;
  anonymous: boolean;
}

export default function StudentReviews() {
  const [activeTab, setActiveTab] = useState<"pending" | "submitted">("pending");
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [submittedReviews, setSubmittedReviews] = useState<SubmittedReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedTeammate, setSelectedTeammate] = useState<any>(null);
  const [selectedProjectName, setSelectedProjectName] = useState("");

  const pendingCount = pendingReviews.reduce((acc, project) => acc + project.teammates.filter((t) => !t.reviewed).length, 0);
  const completedCount = submittedReviews.length;

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setPendingReviews([]);
        setSubmittedReviews([]);
      } catch (error) { console.error("Failed to load reviews:", error); }
      finally { setIsLoading(false); }
    };
    loadData();
  }, []);

  const handleOpenReview = (teammate: any, projectName: string) => {
    setSelectedTeammate(teammate);
    setSelectedProjectName(projectName);
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (data: { teammateId: string; projectId: string; rating: number; feedback: string; anonymous: boolean }) => {
    console.log("Submitting review:", data);
    setPendingReviews((prev) => prev.map((project) => ({
      ...project,
      teammates: project.teammates.map((t) => t.id === data.teammateId ? { ...t, reviewed: true } : t),
      completedCount: project.projectName === data.projectId ? project.completedCount + 1 : project.completedCount,
    })));
    const newReview: SubmittedReview = {
      id: Date.now().toString(), teammateName: selectedTeammate?.name || "", teammateAvatar: selectedTeammate?.avatar || "",
      teammateColor: selectedTeammate?.color || "bg-gray-500", projectName: data.projectId, rating: data.rating, feedback: data.feedback,
      submittedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), anonymous: data.anonymous,
    };
    setSubmittedReviews((prev) => [newReview, ...prev]);
  };

  if (isLoading) {
    return (
      <StudentLayout pageTitle="Peer Reviews">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout pageTitle="Peer Reviews">
      <ClassroomGate>
      <p className="text-white/40 text-sm mb-6 flex items-center gap-2">
        <Lock className="w-4 h-4" />
        Your reviews are anonymous and sent directly to your instructor.
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] rounded-2xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-3xl font-bold text-white mb-1">{pendingCount}</h3>
              <p className="text-white/60 text-sm">Reviews to complete</p>
            </div>
            <Clock className="w-8 h-8 text-white/20" />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-[#065f46] to-[#10b981] rounded-2xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-3xl font-bold text-white mb-1">{completedCount}</h3>
              <p className="text-white/60 text-sm">Reviews submitted</p>
            </div>
            <CheckCircle className="w-8 h-8 text-white/20" />
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="bg-white/[0.06] border border-white/[0.06] rounded-2xl p-1 inline-flex gap-1">
          <button onClick={() => setActiveTab("pending")}
            className={`px-5 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${activeTab === "pending" ? "btn-gradient shadow-lg" : "text-white/40 hover:text-white/60 hover:bg-white/[0.04]"}`}>
            Pending Reviews ({pendingCount})
          </button>
          <button onClick={() => setActiveTab("submitted")}
            className={`px-5 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${activeTab === "submitted" ? "btn-gradient shadow-lg" : "text-white/40 hover:text-white/60 hover:bg-white/[0.04]"}`}>
            Submitted ({completedCount})
          </button>
        </div>
      </div>

      {activeTab === "pending" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {pendingReviews.length > 0 ? (
            pendingReviews.map((project) => (
              <PendingReviewCard key={project.id} projectName={project.projectName} deadline={project.deadline} daysUntilDue={project.daysUntilDue}
                teammates={project.teammates} completedCount={project.teammates.filter((t) => t.reviewed).length} totalCount={project.totalCount}
                onReview={(teammate) => handleOpenReview(teammate, project.projectName)} onViewReview={(teammate) => { console.log("View review for:", teammate.name); }} />
            ))
          ) : (
            <div className="glass-card text-center py-12">
              <Star className="w-12 h-12 text-white/15 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">No pending reviews</h3>
              <p className="text-white/40">You'll be notified when peer reviews open for your projects.</p>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === "submitted" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {submittedReviews.length > 0 ? (
            submittedReviews.map((review) => (
              <SubmittedReviewCard key={review.id} teammateName={review.teammateName} teammateAvatar={review.teammateAvatar} teammateColor={review.teammateColor}
                projectName={review.projectName} rating={review.rating} feedback={review.feedback} submittedAt={review.submittedAt} anonymous={review.anonymous} />
            ))
          ) : (
            <div className="col-span-2 glass-card text-center py-12">
              <Star className="w-12 h-12 text-white/15 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">No reviews yet</h3>
              <p className="text-white/40">Your submitted reviews will appear here.</p>
            </div>
          )}
        </motion.div>
      )}

      <ReviewModal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} teammate={selectedTeammate}
        projectName={selectedProjectName} onSubmit={handleSubmitReview} />
      </ClassroomGate>
    </StudentLayout>
  );
}
