import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Lock, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ClassroomGate } from "@/components/student/ClassroomGate";
import { PendingReviewCard } from "@/components/reviews/PendingReviewCard";
import { SubmittedReviewCard } from "@/components/reviews/SubmittedReviewCard";
import { ReviewModal } from "@/components/reviews/ReviewModal";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";

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
  const navigate = useNavigate();
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [submittedReviews, setSubmittedReviews] = useState<SubmittedReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedTeammate, setSelectedTeammate] = useState<any>(null);
  const [selectedProjectName, setSelectedProjectName] = useState("");

  const pendingCount = pendingReviews.reduce((acc, project) => acc + project.teammates.filter((t) => !t.reviewed).length, 0);

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

  const handleStartReviewing = () => {
    if (pendingReviews.length > 0) {
      const firstUnreviewed = pendingReviews[0].teammates.find(t => !t.reviewed);
      if (firstUnreviewed) {
        handleOpenReview(firstUnreviewed, pendingReviews[0].projectName);
      }
    }
  };

  // Spiral binding circles for cover
  const spiralCircles = Array.from({ length: 18 }, (_, i) => i);

  return (
    <div
      className="min-h-screen w-full relative overflow-auto"
      style={{
        background: "#b8845a",
        backgroundImage: `
          repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0,0,0,0.03) 20px, rgba(0,0,0,0.03) 21px),
          repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(0,0,0,0.02) 40px, rgba(0,0,0,0.02) 41px)
        `,
        boxShadow: "inset 0 0 80px rgba(0,0,0,0.3)",
      }}
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
        <button
          onClick={() => navigate("/student/dashboard")}
          className="flex items-center gap-2 text-white/80 hover:text-white font-['Caveat'] text-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
        <NotificationDropdown />
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-white/60" />
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen pt-16 pb-8" style={{ perspective: "1500px" }}>
          {/* Container that holds both cover and pages in the same position */}
          <div className="relative" style={{ width: isNotebookOpen ? "85vw" : "400px", maxWidth: isNotebookOpen ? "64rem" : "400px", height: isNotebookOpen ? "80vh" : "500px", transition: "width 0.8s ease-in-out, max-width 0.8s ease-in-out, height 0.8s ease-in-out" }}>

            {/* Open notebook pages — sits BEHIND the cover */}
            <motion.div
              className="absolute inset-0"
              animate={isNotebookOpen ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, delay: isNotebookOpen ? 0.35 : 0 }}
              style={{ pointerEvents: isNotebookOpen ? "auto" : "none" }}
            >
              <ClassroomGate>
                <div className="flex h-full rounded-lg overflow-hidden" style={{ boxShadow: "4px 8px 30px rgba(0,0,0,0.4)" }}>
                  {/* Left Page */}
                  <div
                    className="flex-1 relative p-8 flex flex-col"
                    style={{
                      backgroundColor: "#fdf6e3",
                      backgroundImage: "repeating-linear-gradient(transparent, transparent 31px, #e0d6c8 31px, #e0d6c8 32px)",
                    }}
                  >
                    {/* Red margin line */}
                    <div className="absolute top-0 bottom-0" style={{ left: "40px", borderLeft: "2px solid #d4a0a0" }} />
                    <div className="pl-10 flex flex-col items-start justify-center flex-1">
                      <h2 className="font-['Caveat'] text-2xl text-gray-700 mb-6">Reviews to Submit</h2>
                      {pendingCount > 0 ? (
                        <>
                          <span className="font-['Caveat'] text-7xl font-bold text-gray-800 leading-none">{pendingCount}</span>
                          <span className="font-['Caveat'] text-lg text-gray-500 mt-2">peer reviews remaining</span>
                        </>
                      ) : (
                        <>
                          <span className="font-['Caveat'] text-5xl font-bold text-green-600 leading-none">All done! ✓</span>
                          <span className="font-['Caveat'] text-lg text-gray-500 mt-2">No reviews pending</span>
                        </>
                      )}
                      <button onClick={() => setIsNotebookOpen(false)} className="mt-auto font-['Caveat'] text-gray-400 hover:text-gray-600 text-lg transition-colors">
                        ← Close notebook
                      </button>
                    </div>
                  </div>

                  {/* Spiral Spine */}
                  <div className="w-6 relative flex-shrink-0" style={{ background: "linear-gradient(180deg, #d1d5db 0%, #9ca3af 50%, #d1d5db 100%)" }}>
                    <div className="absolute top-2 bottom-2 left-1/2 -translate-x-1/2 w-4" style={{ backgroundImage: "repeating-linear-gradient(transparent, transparent 20px, #6b7280 20px, #6b7280 22px, transparent 22px, transparent 24px)" }} />
                  </div>

                  {/* Right Page */}
                  <div className="flex-1 relative p-8 flex flex-col items-center justify-center" style={{ backgroundColor: "#fdf6e3", backgroundImage: "repeating-linear-gradient(transparent, transparent 31px, #e0d6c8 31px, #e0d6c8 32px)" }}>
                    {pendingCount > 0 ? (
                      <div className="flex flex-col items-center gap-6">
                        <p className="font-['Caveat'] text-2xl text-gray-600 text-center">Ready to review<br />your teammates</p>
                        <motion.button onClick={handleStartReviewing} className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-8 py-4 text-xl font-['Caveat'] transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                          Start Reviewing →
                        </motion.button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4 opacity-50">
                        <Lock className="w-16 h-16 text-gray-300" />
                        <p className="font-['Caveat'] text-xl text-gray-400 text-center">No reviews pending</p>
                      </div>
                    )}
                  </div>
                </div>
              </ClassroomGate>
            </motion.div>

            {/* Notebook cover — sits ON TOP and flips open */}
            <motion.div
              className="absolute rounded-lg"
              animate={isNotebookOpen ? { rotateY: -180 } : { rotateY: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              style={{
                transformOrigin: "left center",
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
                width: "400px",
                height: "500px",
                top: isNotebookOpen ? "calc(50% - 250px)" : 0,
                left: 0,
                zIndex: isNotebookOpen ? 0 : 10,
                backgroundColor: "#2c3e7a",
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")",
                boxShadow: "4px 8px 20px rgba(0,0,0,0.4)",
                pointerEvents: isNotebookOpen ? "none" : "auto",
              }}
            >
              {/* Spiral binding on left edge */}
              <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col items-center justify-between py-4 z-10">
                {spiralCircles.map((i) => (
                  <div key={i} className="w-5 h-5 rounded-full border-2 border-gray-300/80 bg-transparent" style={{ boxShadow: "inset 1px 1px 2px rgba(0,0,0,0.2), 0 1px 1px rgba(255,255,255,0.1)" }} />
                ))}
              </div>

              {/* Cover content */}
              <div className="flex flex-col items-center justify-center h-full pl-6 gap-8">
                <div className="text-center">
                  <h1 className="text-white font-['Caveat'] text-4xl mb-2">Peer Reviews</h1>
                  <div className="w-32 h-px bg-white/20 mx-auto" />
                </div>
                <motion.button
                  onClick={() => setIsNotebookOpen(true)}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-xl px-8 py-3 text-lg font-['Caveat'] cursor-pointer transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Open Notebook
                </motion.button>
              </div>
            </motion.div>

          </div>
        </div>
      )}

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        teammate={selectedTeammate}
        projectName={selectedProjectName}
        onSubmit={handleSubmitReview}
      />
    </div>
  );
}
