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
  teammates: Array<{
    id: string;
    name: string;
    avatar: string;
    role: string;
    color: string;
    reviewed: boolean;
  }>;
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

  // Modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedTeammate, setSelectedTeammate] = useState<any>(null);
  const [selectedProjectName, setSelectedProjectName] = useState("");

  // Calculate stats
  const pendingCount = pendingReviews.reduce(
    (acc, project) => acc + project.teammates.filter((t) => !t.reviewed).length,
    0
  );
  const completedCount = submittedReviews.length;

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API calls
        // const [pendingResponse, submittedResponse] = await Promise.all([
        //   fetch('http://localhost:8000/api/peer-reviews/pending'),
        //   fetch('http://localhost:8000/api/peer-reviews/submitted')
        // ]);
        // const pending = await pendingResponse.json();
        // const submitted = await submittedResponse.json();
        
        await new Promise(resolve => setTimeout(resolve, 500));
        setPendingReviews([]);
        setSubmittedReviews([]);
      } catch (error) {
        console.error("Failed to load reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleOpenReview = (teammate: any, projectName: string) => {
    setSelectedTeammate(teammate);
    setSelectedProjectName(projectName);
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (data: {
    teammateId: string;
    projectId: string;
    rating: number;
    feedback: string;
    anonymous: boolean;
  }) => {
    // TODO: Connect to POST http://localhost:8000/api/peer-reviews
    console.log("Submitting review:", data);

    // Update local state to mark as reviewed
    setPendingReviews((prev) =>
      prev.map((project) => ({
        ...project,
        teammates: project.teammates.map((t) =>
          t.id === data.teammateId ? { ...t, reviewed: true } : t
        ),
        completedCount:
          project.projectName === data.projectId
            ? project.completedCount + 1
            : project.completedCount,
      }))
    );

    // Add to submitted reviews
    const newReview: SubmittedReview = {
      id: Date.now().toString(),
      teammateName: selectedTeammate?.name || "",
      teammateAvatar: selectedTeammate?.avatar || "",
      teammateColor: selectedTeammate?.color || "bg-gray-500",
      projectName: data.projectId,
      rating: data.rating,
      feedback: data.feedback,
      submittedAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      anonymous: data.anonymous,
    };
    setSubmittedReviews((prev) => [newReview, ...prev]);
  };

  if (isLoading) {
    return (
      <StudentLayout pageTitle="Peer Reviews">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-slate-400">Loading reviews...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout pageTitle="Peer Reviews">
      <ClassroomGate>
      <p className="text-slate-500 text-sm mb-6 flex items-center gap-2">
        <Lock className="w-4 h-4" />
        Your reviews are anonymous and sent directly to your instructor.
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-3xl font-bold text-white mb-1">{pendingCount}</h3>
              <p className="text-slate-400 text-sm">Reviews to complete</p>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-slate-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-3xl font-bold text-white mb-1">{completedCount}</h3>
              <p className="text-slate-400 text-sm">Reviews submitted</p>
            </div>
            <div className="w-12 h-12 bg-green-500/15 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-1 inline-flex gap-1">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === "pending"
                ? "bg-blue-500 text-white"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Pending Reviews ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab("submitted")}
            className={`px-6 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === "submitted"
                ? "bg-blue-500 text-white"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Submitted ({completedCount})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "pending" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {pendingReviews.length > 0 ? (
            pendingReviews.map((project) => (
              <PendingReviewCard
                key={project.id}
                projectName={project.projectName}
                deadline={project.deadline}
                daysUntilDue={project.daysUntilDue}
                teammates={project.teammates}
                completedCount={project.teammates.filter((t) => t.reviewed).length}
                totalCount={project.totalCount}
                onReview={(teammate) => handleOpenReview(teammate, project.projectName)}
                onViewReview={(teammate) => {
                  console.log("View review for:", teammate.name);
                }}
              />
            ))
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
              <Star className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">
                No pending reviews
              </h3>
              <p className="text-slate-400">
                You'll be notified when peer reviews open for your projects.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === "submitted" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {submittedReviews.length > 0 ? (
            submittedReviews.map((review) => (
              <SubmittedReviewCard
                key={review.id}
                teammateName={review.teammateName}
                teammateAvatar={review.teammateAvatar}
                teammateColor={review.teammateColor}
                projectName={review.projectName}
                rating={review.rating}
                feedback={review.feedback}
                submittedAt={review.submittedAt}
                anonymous={review.anonymous}
              />
            ))
          ) : (
            <div className="col-span-2 bg-white/5 border border-white/10 rounded-xl p-12 text-center">
              <Star className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">
                No reviews yet
              </h3>
              <p className="text-slate-400">
                Your submitted reviews will appear here.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        teammate={selectedTeammate}
        projectName={selectedProjectName}
        onSubmit={handleSubmitReview}
      />
      </ClassroomGate>
    </StudentLayout>
  );
}
