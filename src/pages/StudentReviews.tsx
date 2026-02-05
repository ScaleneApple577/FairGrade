import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Clock, CheckCircle, Lock } from "lucide-react";
import { StudentLayout } from "@/components/student/StudentLayout";
import { PendingReviewCard } from "@/components/reviews/PendingReviewCard";
import { SubmittedReviewCard } from "@/components/reviews/SubmittedReviewCard";
import { ReviewModal } from "@/components/reviews/ReviewModal";

// ============================================
// API PLACEHOLDER CALLS - Backend developer will connect these
// ============================================

// GET pending reviews
// TODO: Connect to GET /api/peer-reviews/pending
// Returns: array of projects with teammates to review
async function fetchPendingReviews() {
  // Simulated API delay
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockPendingReviews;
}

// GET submitted reviews
// TODO: Connect to GET /api/peer-reviews/submitted
// Returns: array of reviews this student has submitted
async function fetchSubmittedReviews() {
  // Simulated API delay
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockSubmittedReviews;
}

// POST submit a review
// TODO: Connect to POST /api/peer-reviews
// Body: { teammate_id, project_id, rating (decimal), feedback (string), anonymous (boolean) }
// Response: { success: true }
async function submitReview(data: {
  teammateId: string;
  projectId: string;
  rating: number;
  feedback: string;
  anonymous: boolean;
}) {
  // Simulated API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log("Submitting review:", data);
  return { success: true };
}

// ============================================
// MOCK DATA
// ============================================

const mockPendingReviews = [
  {
    id: "1",
    projectName: "CS 101 Final Project",
    deadline: "Feb 8, 2026",
    daysUntilDue: 2,
    teammates: [
      {
        id: "alice",
        name: "Alice Johnson",
        avatar: "A",
        role: "Frontend Developer",
        color: "bg-emerald-500",
        reviewed: false,
      },
      {
        id: "bob",
        name: "Bob Smith",
        avatar: "B",
        role: "Backend Developer",
        color: "bg-purple-500",
        reviewed: false,
      },
      {
        id: "dave",
        name: "Dave Wilson",
        avatar: "D",
        role: "Project Manager",
        color: "bg-rose-500",
        reviewed: false,
      },
    ],
    completedCount: 0,
    totalCount: 3,
  },
  {
    id: "2",
    projectName: "Marketing Campaign",
    deadline: "Feb 18, 2026",
    daysUntilDue: 12,
    teammates: [
      {
        id: "sarah",
        name: "Sarah Lee",
        avatar: "S",
        role: "Content Writer",
        color: "bg-green-500",
        reviewed: true,
      },
      {
        id: "mike",
        name: "Mike Chen",
        avatar: "M",
        role: "Designer",
        color: "bg-blue-500",
        reviewed: false,
      },
      {
        id: "emma",
        name: "Emma Davis",
        avatar: "E",
        role: "Strategist",
        color: "bg-pink-500",
        reviewed: false,
      },
      {
        id: "john",
        name: "John Park",
        avatar: "J",
        role: "Analyst",
        color: "bg-orange-500",
        reviewed: false,
      },
    ],
    completedCount: 1,
    totalCount: 4,
  },
];

const mockSubmittedReviews = [
  {
    id: "1",
    teammateName: "Sarah Lee",
    teammateAvatar: "S",
    teammateColor: "bg-green-500",
    projectName: "Marketing Campaign",
    rating: 4.5,
    feedback:
      "Sarah was an excellent team player. She consistently delivered high-quality content on time and was always willing to help others with their tasks.",
    submittedAt: "Feb 3, 2026",
    anonymous: true,
  },
  {
    id: "2",
    teammateName: "Jane Doe",
    teammateAvatar: "J",
    teammateColor: "bg-purple-500",
    projectName: "Biology Lab Report",
    rating: 5.0,
    feedback:
      "Jane was outstanding in coordinating our lab experiments. Her attention to detail ensured our data was accurate and well-documented.",
    submittedAt: "Jan 28, 2026",
    anonymous: true,
  },
  {
    id: "3",
    teammateName: "Tom Harris",
    teammateAvatar: "T",
    teammateColor: "bg-orange-500",
    projectName: "Biology Lab Report",
    rating: 4.0,
    feedback:
      "Tom contributed well to the project, especially in the analysis phase. Could improve on meeting deadlines but overall a reliable teammate.",
    submittedAt: "Jan 28, 2026",
    anonymous: false,
  },
  {
    id: "4",
    teammateName: "Lisa Wang",
    teammateAvatar: "L",
    teammateColor: "bg-teal-500",
    projectName: "History Research Paper",
    rating: 4.8,
    feedback:
      "Lisa's research skills are exceptional. She found primary sources that really strengthened our arguments. Great communicator too.",
    submittedAt: "Jan 15, 2026",
    anonymous: true,
  },
  {
    id: "5",
    teammateName: "Mark Brown",
    teammateAvatar: "M",
    teammateColor: "bg-indigo-500",
    projectName: "History Research Paper",
    rating: 3.5,
    feedback:
      "Mark did his assigned sections adequately. Would benefit from being more proactive in group discussions and contributing ideas earlier.",
    submittedAt: "Jan 15, 2026",
    anonymous: true,
  },
  {
    id: "6",
    teammateName: "Amy Taylor",
    teammateAvatar: "A",
    teammateColor: "bg-rose-500",
    projectName: "History Research Paper",
    rating: 4.5,
    feedback:
      "Amy was great at synthesizing everyone's work into a cohesive final paper. Her editing skills really polished our submission.",
    submittedAt: "Jan 15, 2026",
    anonymous: true,
  },
  {
    id: "7",
    teammateName: "Chris Adams",
    teammateAvatar: "C",
    teammateColor: "bg-cyan-500",
    projectName: "Intro to Economics",
    rating: 4.2,
    feedback:
      "Chris brought valuable insights from his economics background. Helpful in group meetings and responsive on Slack.",
    submittedAt: "Dec 20, 2025",
    anonymous: false,
  },
  {
    id: "8",
    teammateName: "Diana Ross",
    teammateAvatar: "D",
    teammateColor: "bg-amber-500",
    projectName: "Intro to Economics",
    rating: 4.7,
    feedback:
      "Diana took initiative on the presentation slides and did an amazing job. Very organized and kept the team on track.",
    submittedAt: "Dec 20, 2025",
    anonymous: true,
  },
];

// ============================================
// COMPONENT
// ============================================

export default function StudentReviews() {
  const [activeTab, setActiveTab] = useState<"pending" | "submitted">("pending");
  const [pendingReviews, setPendingReviews] = useState(mockPendingReviews);
  const [submittedReviews, setSubmittedReviews] = useState(mockSubmittedReviews);
  const [isLoading, setIsLoading] = useState(false);

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
  const hasDueSoon = pendingReviews.some((p) => p.daysUntilDue <= 3);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [pending, submitted] = await Promise.all([
          fetchPendingReviews(),
          fetchSubmittedReviews(),
        ]);
        setPendingReviews(pending);
        setSubmittedReviews(submitted);
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
    await submitReview(data);

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
    const newReview = {
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

  return (
    <StudentLayout pageTitle="Peer Reviews">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-blue-500/15 rounded-lg flex items-center justify-center">
            <Star className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Peer Reviews</h1>
            <p className="text-slate-400">Rate your teammates' contributions</p>
          </div>
        </div>
        <p className="text-slate-500 text-sm mt-4 flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Your reviews are anonymous and sent directly to your instructor.
        </p>
      </motion.div>

      {/* Stats Cards - Only 2 */}
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
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                hasDueSoon ? "bg-yellow-500/15" : "bg-white/10"
              }`}
            >
              <Clock
                className={`w-6 h-6 ${hasDueSoon ? "text-yellow-400" : "text-slate-400"}`}
              />
            </div>
          </div>
          {hasDueSoon && (
            <p className="text-yellow-400 text-xs mt-3 flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              Some reviews due soon
            </p>
          )}
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

      {/* Tabs - Only 2 */}
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
          {pendingReviews.map((project) => (
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
                // Could open a view-only modal here
                console.log("View review for:", teammate.name);
              }}
            />
          ))}

          {pendingReviews.length === 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">
                All caught up!
              </h3>
              <p className="text-slate-400">
                You have no pending peer reviews at this time.
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
          {submittedReviews.map((review) => (
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
          ))}

          {submittedReviews.length === 0 && (
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
    </StudentLayout>
  );
}
