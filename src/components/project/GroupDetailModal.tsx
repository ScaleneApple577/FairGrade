import { X, AlertTriangle, FileText, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface GroupDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string | null;
}

// Mock data for Group 2
const groupData = {
  name: "Group 2",
  project: "CS 101 Final Project",
  members: [
    {
      id: "1",
      name: "David Martinez",
      email: "david.martinez@school.edu",
      avatar: "DM",
      contribution: 55,
      status: "top",
      stats: {
        documentEdits: { percent: 58, value: "1,247 characters" },
        meetings: { value: "5/5 ✓", detail: "Camera on 92%" },
        tasks: { value: "8/8 ✓", detail: "100% complete" },
        lastActive: { value: "2h ago", detail: "● Online now" },
      },
    },
    {
      id: "2",
      name: "Emma Wilson",
      email: "emma.wilson@school.edu",
      avatar: "EW",
      contribution: 32,
      status: "average",
      stats: {
        documentEdits: { percent: 35, value: "723 characters" },
        meetings: { value: "5/5 ✓", detail: "Camera on 78%" },
        tasks: { value: "6/8", detail: "2 pending" },
        lastActive: { value: "1d ago", detail: "○ Offline" },
      },
    },
    {
      id: "3",
      name: "Frank Chen",
      email: "frank.chen@school.edu",
      avatar: "FC",
      contribution: 13,
      status: "low",
      stats: {
        documentEdits: { percent: 7, value: "Only 89 characters" },
        meetings: { value: "2/5", detail: "3 absences" },
        tasks: { value: "2/8", detail: "6 incomplete" },
        lastActive: { value: "5d ago", detail: "○ Inactive" },
      },
    },
  ],
  baseGrade: 85,
};

const COLORS = ["hsl(217, 91%, 60%)", "hsl(160, 84%, 39%)", "hsl(38, 92%, 50%)"];

const pieData = groupData.members.map((m, i) => ({
  name: m.name,
  value: m.contribution,
  color: COLORS[i],
}));

const statusConfig = {
  top: { label: "Most active contributor", color: "text-success" },
  average: { label: "On track", color: "text-muted-foreground" },
  low: { label: "⚠️ Needs attention", color: "text-warning" },
};

const gradeModifiers = [
  { name: "David Martinez", avatar: "DM", modifier: "+6%", color: "text-success bg-success/10" },
  { name: "Emma Wilson", avatar: "EW", modifier: "0%", color: "text-muted-foreground bg-muted" },
  { name: "Frank Chen", avatar: "FC", modifier: "-13%", color: "text-destructive bg-destructive/10" },
];

export function GroupDetailModal({ isOpen, onClose, groupId }: GroupDetailModalProps) {
  if (!groupId) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-card shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {groupData.name} - Contribution Details
                </h2>
                <p className="text-sm text-muted-foreground">
                  {groupData.project} • {groupData.members.length} members
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 space-y-6">
              {/* Pie Chart */}
              <div className="bg-muted/30 rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-4">Contribution Breakdown</h3>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => `${value}%`}
                          contentStyle={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend */}
                  <div className="flex-1 space-y-3">
                    {groupData.members.map((member, index) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index] }}
                          />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {member.name}
                            </p>
                            <p className={`text-xs ${statusConfig[member.status as keyof typeof statusConfig].color}`}>
                              {statusConfig[member.status as keyof typeof statusConfig].label}
                            </p>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-foreground">
                          {member.contribution}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Individual Breakdown */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">Individual Breakdown</h3>
                <div className="space-y-4">
                  {groupData.members.map((member) => (
                    <div
                      key={member.id}
                      className={`bg-card rounded-xl border p-4 ${
                        member.status === "low"
                          ? "border-destructive/30 bg-destructive/5"
                          : "border-border"
                      }`}
                    >
                      {/* Member Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                              member.status === "top"
                                ? "bg-success text-success-foreground"
                                : member.status === "low"
                                ? "bg-destructive text-destructive-foreground"
                                : "bg-primary text-primary-foreground"
                            }`}
                          >
                            {member.avatar}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            member.status === "top"
                              ? "bg-success/10 text-success"
                              : member.status === "low"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {member.contribution}% Contribution
                        </span>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Document Edits</p>
                          <p className="font-semibold text-foreground">
                            {member.stats.documentEdits.percent}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.stats.documentEdits.value}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Meetings</p>
                          <p className="font-semibold text-foreground">
                            {member.stats.meetings.value}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.stats.meetings.detail}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Tasks Done</p>
                          <p className="font-semibold text-foreground">
                            {member.stats.tasks.value}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.stats.tasks.detail}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Last Active</p>
                          <p className="font-semibold text-foreground">
                            {member.stats.lastActive.value}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.stats.lastActive.detail}
                          </p>
                        </div>
                      </div>

                      {/* Generate Report for low contributors */}
                      {member.status === "low" && (
                        <div className="mt-4">
                          <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Generate Dispute Report for {member.name.split(" ")[0]}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Grade Suggestions */}
              <div className="bg-success/5 border border-success/20 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-5 w-5 text-success" />
                  <h3 className="font-semibold text-foreground">
                    Suggested Grade Adjustments
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Based on contribution data. You can override these suggestions below.
                </p>

                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-sm font-medium text-foreground">
                    Group Grade (base score)
                  </span>
                  <span className="text-lg font-bold text-foreground">
                    {groupData.baseGrade}%
                  </span>
                </div>

                <div className="space-y-3 mt-4">
                  {gradeModifiers.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                          {item.avatar}
                        </div>
                        <span className="text-sm text-foreground">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${item.color}`}>
                          {item.modifier} modifier
                        </span>
                        <input
                          type="number"
                          className="w-16 text-center border border-border rounded-lg px-2 py-1 text-sm"
                          defaultValue={parseInt(item.modifier)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-border flex items-center gap-3">
              <Button className="flex-1 bg-success hover:bg-success/90">
                <FileText className="h-4 w-4 mr-2" />
                Apply Grades to Gradebook
              </Button>
              <Button variant="outline">Save Draft</Button>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
