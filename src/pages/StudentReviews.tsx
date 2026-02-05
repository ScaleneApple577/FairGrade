import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Star,
  Clock,
  CheckCircle,
  TrendingUp,
  Users,
  Info,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StudentLayout } from "@/components/student/StudentLayout";

// Mock data
const mockStats = {
  pendingReviews: 3,
  completedReviews: 8,
  averageRating: 4.2,
  reviewsReceived: 12,
};

const mockPendingReviews = [
  {
    id: "1",
    projectName: "CS 101 Final Project",
    deadline: "Feb 8, 2026",
    daysUntilDue: 2,
    isUrgent: true,
    teammates: [
      { id: "alice", name: "Alice Johnson", avatar: "A", role: "Frontend Developer", color: "bg-green-500" },
      { id: "bob", name: "Bob Smith", avatar: "B", role: "Backend Developer", color: "bg-purple-500" },
      { id: "dave", name: "Dave Wilson", avatar: "D", role: "Project Manager", color: "bg-red-500" },
    ],
    completedCount: 0,
    totalCount: 3,
  },
  {
    id: "2",
    projectName: "Marketing Campaign",
    deadline: "Feb 18, 2026",
    daysUntilDue: 12,
    isUrgent: false,
    teammates: [
      { id: "sarah", name: "Sarah Lee", avatar: "S", role: "Content Writer", color: "bg-green-500", reviewed: true },
      { id: "mike", name: "Mike Chen", avatar: "M", role: "Designer", color: "bg-blue-500" },
      { id: "emma", name: "Emma Davis", avatar: "E", role: "Strategist", color: "bg-pink-500" },
      { id: "john", name: "John Park", avatar: "J", role: "Analyst", color: "bg-orange-500" },
    ],
    completedCount: 1,
    totalCount: 4,
  },
];

const mockCompletedReviews = [
  {
    id: "1",
    projectName: "Biology Lab Report",
    submittedAt: "Jan 28, 2026",
    reviewees: [
      { id: "jane", name: "Jane Doe", avatar: "J", color: "bg-purple-500", overallRating: 5 },
      { id: "tom", name: "Tom Harris", avatar: "T", color: "bg-orange-500", overallRating: 4 },
    ],
  },
  {
    id: "2",
    projectName: "History Research Paper",
    submittedAt: "Jan 15, 2026",
    reviewees: [
      { id: "lisa", name: "Lisa Wang", avatar: "L", color: "bg-teal-500", overallRating: 5 },
      { id: "mark", name: "Mark Brown", avatar: "M", color: "bg-indigo-500", overallRating: 4 },
      { id: "amy", name: "Amy Taylor", avatar: "A", color: "bg-rose-500", overallRating: 5 },
    ],
  },
];

const mockReceivedFeedback = [
  {
    id: "1",
    projectName: "CS 101 Final Project",
    overallRating: 5,
    comments: "Great team player! Always responsive and completed tasks on time. Really helped push the project forward.",
    submittedAt: "Jan 28",
    isPositive: true,
  },
  {
    id: "2",
    projectName: "Marketing Campaign",
    overallRating: 4,
    comments: "Solid work ethic and good ideas. Could improve on communication - sometimes hard to reach during crunch time.",
    submittedAt: "Jan 25",
    isPositive: false,
  },
  {
    id: "3",
    projectName: "Biology Lab Report",
    overallRating: 4.5,
    comments: "Very reliable and professional. Excellent at coordinating the team and keeping everyone on track.",
    submittedAt: "Jan 20",
    isPositive: true,
  },
];

// Star rating component
function StarRating({ 
  rating, 
  onRate, 
  size = "md", 
  interactive = false 
}: { 
  rating: number; 
  onRate?: (rating: number) => void; 
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
}) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => interactive && onRate?.(star)}
          disabled={!interactive}
          className={interactive ? "transition-transform hover:scale-110" : ""}
        >
          <Star
            className={`${sizeClasses[size]} ${
              star <= rating
                ? "text-yellow-500 fill-yellow-500"
                : "text-slate-500"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function StudentReviews() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"pending" | "completed" | "received">("pending");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedTeammate, setSelectedTeammate] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  
  // Review form state
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [overallRating, setOverallRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [contributionRating, setContributionRating] = useState(0);
  const [reliabilityRating, setReliabilityRating] = useState(0);
  const [teamworkRating, setTeamworkRating] = useState(0);
  const [comments, setComments] = useState("");

  const openReviewModal = (teammate: any, project: any) => {
    setSelectedTeammate(teammate);
    setSelectedProject(project);
    setShowReviewModal(true);
    // Reset form
    setOverallRating(0);
    setCommunicationRating(0);
    setContributionRating(0);
    setReliabilityRating(0);
    setTeamworkRating(0);
    setComments("");
    setIsAnonymous(true);
  };

  const handleSubmitReview = async () => {
    if (!overallRating || !communicationRating || !contributionRating || !reliabilityRating || !teamworkRating) {
      toast.error("Please rate all categories");
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success(`Review submitted for ${selectedTeammate?.name}`);
    setShowReviewModal(false);
  };

  const hasLowRating = overallRating < 3 || communicationRating < 3 || contributionRating < 3 || reliabilityRating < 3 || teamworkRating < 3;
  const allRatingsComplete = overallRating > 0 && communicationRating > 0 && contributionRating > 0 && reliabilityRating > 0 && teamworkRating > 0;

  return (
    <StudentLayout pageTitle="Peer Reviews">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Peer Reviews</h1>
                <p className="text-slate-600 mt-1">Evaluate your teammates' contributions</p>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">How Peer Reviews Work</h3>
                  <p className="text-sm text-blue-800">
                    Peer reviews open 1 week before project deadlines and close at the deadline.
                    Your reviews are <strong>anonymous by default</strong> and help ensure fair grading.
                    Be honest and constructive in your feedback.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg border border-slate-200 p-6"
            >
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">{mockStats.pendingReviews}</h3>
              <p className="text-slate-600 text-sm mb-2">Pending Reviews</p>
              <div className="flex items-center gap-1 text-xs text-yellow-600">
                <AlertCircle className="w-3 h-3" />
                <span>Due within 5 days</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg border border-slate-200 p-6"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">{mockStats.completedReviews}</h3>
              <p className="text-slate-600 text-sm mb-2">Completed Reviews</p>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="w-3 h-3" />
                <span>100% completion rate</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg border border-slate-200 p-6"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">{mockStats.averageRating}/5</h3>
              <p className="text-slate-600 text-sm mb-2">My Average Rating</p>
              <div className="flex items-center gap-1 text-xs text-purple-600">
                <TrendingUp className="w-3 h-3" />
                <span>Based on 12 reviews</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg border border-slate-200 p-6"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">{mockStats.reviewsReceived}</h3>
              <p className="text-slate-600 text-sm mb-2">Reviews Received</p>
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <Info className="w-3 h-3" />
                <span>From 3 projects</span>
              </div>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-2 inline-flex gap-2">
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "pending"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                Pending Reviews ({mockStats.pendingReviews})
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "completed"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                Completed ({mockStats.completedReviews})
              </button>
              <button
                onClick={() => setActiveTab("received")}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "received"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                My Reviews ({mockStats.reviewsReceived})
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
              {mockPendingReviews.map((project) => (
                <div
                  key={project.id}
                  className={`bg-white rounded-xl shadow-lg p-6 ${
                    project.isUrgent ? "border-2 border-yellow-300" : "border border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-slate-900">{project.projectName}</h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-medium ${
                            project.isUrgent
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          Due in {project.daysUntilDue} days
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        Review {project.totalCount} teammates • Closes {project.deadline}
                      </p>
                    </div>
                    <Clock className={`w-5 h-5 ${project.isUrgent ? "text-yellow-500" : "text-slate-400"}`} />
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Progress</span>
                      <span className="font-semibold text-slate-900">
                        {project.completedCount} of {project.totalCount} completed
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${project.isUrgent ? "bg-yellow-500" : "bg-blue-500"}`}
                        style={{ width: `${(project.completedCount / project.totalCount) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Teammates */}
                  <div className="space-y-3 mb-4">
                    {project.teammates.map((teammate) => (
                      <div
                        key={teammate.id}
                        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                          teammate.reviewed
                            ? "bg-green-50 border border-green-200"
                            : "bg-slate-50 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 ${teammate.color} rounded-full flex items-center justify-center text-white font-bold`}
                          >
                            {teammate.avatar}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{teammate.name}</p>
                            <p className={`text-xs ${teammate.reviewed ? "text-green-600 flex items-center gap-1" : "text-slate-500"}`}>
                              {teammate.reviewed ? (
                                <>
                                  <CheckCircle className="w-3 h-3" />
                                  Review submitted
                                </>
                              ) : (
                                teammate.role
                              )}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => !teammate.reviewed && openReviewModal(teammate, project)}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                            teammate.reviewed
                              ? "border-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                              : "bg-blue-500 text-white hover:bg-blue-600"
                          }`}
                        >
                          {teammate.reviewed ? "View" : "Review"}
                        </button>
                      </div>
                    ))}
                  </div>

                  {project.isUrgent && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                      <p className="text-sm text-yellow-800">
                        <strong>Reminder:</strong> Complete all reviews before {project.deadline} to help ensure fair grading.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "completed" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {mockCompletedReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-xl shadow-lg border border-slate-200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{review.projectName}</h3>
                      <p className="text-sm text-slate-600">
                        Reviewed {review.reviewees.length} teammates • Submitted {review.submittedAt}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Complete
                    </span>
                  </div>

                  <div className="space-y-2">
                    {review.reviewees.map((reviewee) => (
                      <div
                        key={reviewee.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 ${reviewee.color} rounded-full flex items-center justify-center text-white text-xs font-bold`}
                          >
                            {reviewee.avatar}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{reviewee.name}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <StarRating rating={reviewee.overallRating} size="sm" />
                              <span className="text-xs text-slate-500 ml-1">
                                {reviewee.overallRating}.0 overall
                              </span>
                            </div>
                          </div>
                        </div>
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          View Details
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "received" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Summary Card */}
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 mb-6 text-white">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Your Peer Review Summary</h2>
                    <p className="text-blue-100">Based on feedback from 12 teammates across 3 projects</p>
                  </div>
                  <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Star className="w-10 h-10" />
                  </div>
                </div>

                {/* Overall Rating */}
                <div className="bg-white bg-opacity-20 rounded-xl p-6 mb-4">
                  <p className="text-sm text-blue-100 mb-2">Overall Rating</p>
                  <div className="flex items-center gap-4">
                    <span className="text-5xl font-bold">4.2</span>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4].map((star) => (
                          <Star key={star} className="w-6 h-6 fill-white" />
                        ))}
                        <Star className="w-6 h-6 fill-white opacity-40" />
                      </div>
                      <p className="text-sm text-blue-100">out of 5.0</p>
                    </div>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white bg-opacity-10 rounded-lg p-4">
                    <p className="text-xs text-blue-100 mb-1">Communication</p>
                    <p className="text-2xl font-bold">4.5</p>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-lg p-4">
                    <p className="text-xs text-blue-100 mb-1">Contribution</p>
                    <p className="text-2xl font-bold">4.1</p>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-lg p-4">
                    <p className="text-xs text-blue-100 mb-1">Reliability</p>
                    <p className="text-2xl font-bold">4.3</p>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-lg p-4">
                    <p className="text-xs text-blue-100 mb-1">Teamwork</p>
                    <p className="text-2xl font-bold">4.0</p>
                  </div>
                </div>
              </div>

              {/* Feedback */}
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Feedback from Teammates</h3>
                <p className="text-sm text-slate-600 mb-6">
                  All reviews are anonymous to encourage honest feedback
                </p>

                <div className="space-y-4">
                  {mockReceivedFeedback.map((feedback) => (
                    <div
                      key={feedback.id}
                      className={`border rounded-lg p-4 ${
                        feedback.isPositive ? "bg-green-50 border-slate-200" : "border-slate-200"
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center text-slate-600 text-xs font-bold">
                          ?
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-900">Anonymous Teammate</span>
                            <span className="text-xs text-slate-500">• {feedback.projectName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <StarRating rating={Math.floor(feedback.overallRating)} size="sm" />
                            <span className="text-xs text-slate-600 ml-1">
                              {feedback.overallRating} overall
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-slate-500">{feedback.submittedAt}</span>
                      </div>
                      <p className="text-sm text-slate-700 italic">"{feedback.comments}"</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rating Trend */}
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Rating Trend</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-slate-700">Communication</span>
                      <span className="font-bold text-slate-900">4.5/5</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full" style={{ width: "90%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-slate-700">Contribution</span>
                      <span className="font-bold text-slate-900">4.1/5</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div className="bg-blue-500 h-3 rounded-full" style={{ width: "82%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-slate-700">Reliability</span>
                      <span className="font-bold text-slate-900">4.3/5</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div className="bg-purple-500 h-3 rounded-full" style={{ width: "86%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-slate-700">Teamwork</span>
                      <span className="font-bold text-slate-900">4.0/5</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div className="bg-yellow-500 h-3 rounded-full" style={{ width: "80%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

      {/* Review Modal */}
      {showReviewModal && selectedTeammate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 ${selectedTeammate.color} rounded-full flex items-center justify-center text-white font-bold text-lg`}
                >
                  {selectedTeammate.avatar}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Review {selectedTeammate.name}</h2>
                  <p className="text-sm text-slate-600">
                    {selectedProject?.projectName} • {selectedTeammate.role}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Anonymous Toggle */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-5 h-5 text-blue-500 border-slate-300 rounded focus:ring-blue-500 mt-0.5"
                  />
                  <div>
                    <span className="font-semibold text-blue-900">Submit review anonymously</span>
                    <p className="text-sm text-blue-800 mt-1">
                      Your teammate won't see your name. Anonymous reviews encourage honest feedback.
                    </p>
                  </div>
                </label>
              </div>

              {/* Overall Rating */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">Overall Rating *</label>
                <div className="flex items-center gap-2">
                  <StarRating rating={overallRating} onRate={setOverallRating} size="lg" interactive />
                  <span className="ml-3 text-lg font-semibold text-slate-900">
                    {overallRating > 0 ? `${overallRating}.0` : "Not rated"}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <p className="text-sm text-slate-600 mb-4">Rate each category (1-5 stars)</p>

                {/* Communication */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">Communication</label>
                    <span className="text-sm text-slate-500">How well did they communicate?</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating rating={communicationRating} onRate={setCommunicationRating} size="md" interactive />
                    <span className="ml-2 text-sm font-semibold text-slate-700">
                      {communicationRating > 0 ? `${communicationRating}.0` : "-"}
                    </span>
                  </div>
                </div>

                {/* Contribution */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">Contribution</label>
                    <span className="text-sm text-slate-500">How much did they contribute?</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating rating={contributionRating} onRate={setContributionRating} size="md" interactive />
                    <span className="ml-2 text-sm font-semibold text-slate-700">
                      {contributionRating > 0 ? `${contributionRating}.0` : "-"}
                    </span>
                  </div>
                </div>

                {/* Reliability */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">Reliability</label>
                    <span className="text-sm text-slate-500">Did they meet deadlines?</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating rating={reliabilityRating} onRate={setReliabilityRating} size="md" interactive />
                    <span className="ml-2 text-sm font-semibold text-slate-700">
                      {reliabilityRating > 0 ? `${reliabilityRating}.0` : "-"}
                    </span>
                  </div>
                </div>

                {/* Teamwork */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">Teamwork</label>
                    <span className="text-sm text-slate-500">Were they a good team player?</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating rating={teamworkRating} onRate={setTeamworkRating} size="md" interactive />
                    <span className="ml-2 text-sm font-semibold text-slate-700">
                      {teamworkRating > 0 ? `${teamworkRating}.0` : "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Additional Comments (Optional)
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Be constructive and specific. What did they do well? What could they improve?
                </p>
                <textarea
                  rows={5}
                  placeholder="Share specific examples of their work ethic, communication style, or contributions..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={comments}
                  onChange={(e) => setComments(e.target.value.slice(0, 500))}
                />
                <p className="text-xs text-slate-500 mt-1">{comments.length}/500 characters</p>
              </div>

              {/* Low Rating Warning */}
              {hasLowRating && allRatingsComplete && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-900 mb-1">Low Rating Detected</p>
                    <p className="text-sm text-yellow-800">
                      You've given a rating below 3 stars. Please provide specific comments explaining your rating to help your teammate improve.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-slate-200">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={!allRatingsComplete}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                Submit Review
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </StudentLayout>
  );
}
