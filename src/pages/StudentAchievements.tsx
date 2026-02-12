import { useState, useEffect } from "react";
import { Trophy, Lock } from "lucide-react";
import { StudentLayout } from "@/components/student/StudentLayout";

// All 30 achievements definition
const allAchievements = [
  { id: "first_words", emoji: "📝", name: "First Words", description: "Write your first 100 words in a project", category: "contribution" },
  { id: "wordsmith", emoji: "✍️", name: "Wordsmith", description: "Write 1,000 total words across all projects", category: "contribution" },
  { id: "author", emoji: "📚", name: "Author", description: "Write 5,000 total words across all projects", category: "contribution" },
  { id: "prolific_writer", emoji: "📖", name: "Prolific Writer", description: "Write 10,000 total words across all projects", category: "contribution" },
  { id: "builder", emoji: "🏗️", name: "Builder", description: "Complete 10 tasks across all projects", category: "contribution" },
  { id: "task_machine", emoji: "⚡", name: "Task Machine", description: "Complete 50 tasks across all projects", category: "contribution" },
  { id: "communicator", emoji: "💬", name: "Communicator", description: "Leave 10 comments on shared documents", category: "collaboration" },
  { id: "feedback_pro", emoji: "🗣️", name: "Feedback Pro", description: "Leave 50 comments across all projects", category: "collaboration" },
  { id: "team_player", emoji: "🤝", name: "Team Player", description: "Attend 10 team meetings", category: "collaboration" },
  { id: "reliable", emoji: "🎯", name: "Reliable", description: "Attend 25 consecutive meetings without missing one", category: "collaboration" },
  { id: "helpful_reviewer", emoji: "⭐", name: "Helpful Reviewer", description: "Submit 5 peer reviews", category: "collaboration" },
  { id: "review_master", emoji: "🌟", name: "Review Master", description: "Submit 20 peer reviews", category: "collaboration" },
  { id: "day_one", emoji: "📆", name: "Day One", description: "Make a contribution on your first day in a project", category: "consistency" },
  { id: "streak_starter", emoji: "🔥", name: "Streak Starter", description: "Contribute 3 days in a row", category: "consistency" },
  { id: "on_fire", emoji: "🔥🔥", name: "On Fire", description: "Contribute 7 days in a row", category: "consistency" },
  { id: "unstoppable", emoji: "🔥🔥🔥", name: "Unstoppable", description: "Contribute 14 days in a row", category: "consistency" },
  { id: "early_bird", emoji: "⏰", name: "Early Bird", description: "Submit a task more than 48 hours before the deadline", category: "consistency" },
  { id: "steady_pace", emoji: "📊", name: "Steady Pace", description: "Maintain an even work distribution (consistency score > 80)", category: "consistency" },
  { id: "quality_work", emoji: "💎", name: "Quality Work", description: "Have 95%+ of your words survive to the final document", category: "quality" },
  { id: "peer_approved", emoji: "🎖️", name: "Peer Approved", description: "Receive an average peer rating of 4.0+", category: "quality" },
  { id: "mvp", emoji: "👑", name: "MVP", description: "Receive the highest peer rating on your team", category: "quality" },
  { id: "original_thinker", emoji: "🧠", name: "Original Thinker", description: "Complete a project with 0 AI content flags", category: "quality" },
  { id: "integrity_first", emoji: "✅", name: "Integrity First", description: "Complete a project with 0 plagiarism flags", category: "quality" },
  { id: "high_scorer", emoji: "🏆", name: "High Scorer", description: "Achieve a FairScore of 90+ on any project", category: "quality" },
  { id: "first_project", emoji: "👋", name: "First Project", description: "Join your first project", category: "social" },
  { id: "multi_tasker", emoji: "🎓", name: "Multi-Tasker", description: "Be active in 3+ projects simultaneously", category: "social" },
  { id: "schedule_master", emoji: "📅", name: "Schedule Master", description: "Mark availability and help schedule 5 meetings", category: "social" },
  { id: "poll_creator", emoji: "🗳️", name: "Poll Creator", description: "Create a When2Meet-style availability poll", category: "social" },
  { id: "goal_setter", emoji: "🎯", name: "Goal Setter", description: "Set and complete a personal goal", category: "social" },
  { id: "well_rounded", emoji: "🌈", name: "Well-Rounded", description: "Score above 70 in ALL five FairScore categories", category: "social" },
];

const categories = [
  { key: "all", label: "All" },
  { key: "contribution", label: "Contribution" },
  { key: "collaboration", label: "Collaboration" },
  { key: "consistency", label: "Consistency" },
  { key: "quality", label: "Quality" },
  { key: "social", label: "Social" },
];

interface Achievement {
  id: string;
  unlocked: boolean;
  unlocked_at: string | null;
}

export default function StudentAchievements() {
  const [filter, setFilter] = useState("all");
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    // TODO: GET /api/student/achievements
  }, []);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const isUnlocked = (id: string) => achievements.find(a => a.id === id)?.unlocked || false;

  const filtered = filter === "all" 
    ? allAchievements 
    : allAchievements.filter(a => a.category === filter);

  return (
    <StudentLayout pageTitle="Achievements">
      {/* Progress Header */}
      <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Achievements
            </h2>
            <p className="text-slate-400 text-sm mt-1">Track your progress and unlock milestones</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{unlockedCount}<span className="text-slate-500 text-lg">/{allAchievements.length}</span></p>
            <p className="text-slate-400 text-xs">Unlocked</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
            style={{ width: `${(unlockedCount / allAchievements.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setFilter(cat.key)}
            className={`px-3 py-1.5 rounded-lg text-sm transition ${
              filter === cat.key
                ? "bg-blue-500 text-white"
                : "bg-white/10 text-slate-400 hover:text-white hover:bg-white/15"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(achievement => {
          const unlocked = isUnlocked(achievement.id);
          return (
            <div
              key={achievement.id}
              className={`rounded-xl border p-5 transition ${
                unlocked
                  ? "bg-white/[0.06] border-white/15"
                  : "bg-white/[0.02] border-white/5 opacity-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{unlocked ? achievement.emoji : "🔒"}</div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${unlocked ? "text-white" : "text-slate-500"}`}>
                    {achievement.name}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">{achievement.description}</p>
                  <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-400 capitalize">
                    {achievement.category}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </StudentLayout>
  );
}
