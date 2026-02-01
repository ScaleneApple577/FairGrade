import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EnhancedProjectCard, EmptyProjectCard } from "@/components/dashboard/EnhancedProjectCard";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for demo
const mockProjects = [
  {
    id: "1",
    name: "CS 101 Final Project",
    course: "Computer Science 101",
    status: "active" as const,
    deadline: "12 days",
    deadlineDate: "March 15",
    groupCount: 5,
    studentCount: 20,
    onlineNow: 5,
    eventsToday: 234,
    flags: {
      count: 3,
      aiDetected: 2,
      plagiarism: 1,
    },
  },
  {
    id: "2",
    name: "MATH 250 Midterm",
    course: "Mathematics 250",
    status: "active" as const,
    deadline: "5 days",
    deadlineDate: "March 8",
    groupCount: 3,
    studentCount: 12,
    onlineNow: 3,
    eventsToday: 89,
  },
  {
    id: "3",
    name: "ENG 202 Essay",
    course: "English 202",
    status: "completed" as const,
    deadline: "Feb 15",
    groupCount: 4,
    studentCount: 16,
    onlineNow: 0,
    eventsToday: 0,
  },
];

export default function Dashboard() {
  const [filter, setFilter] = useState("all");

  const filteredProjects = mockProjects.filter((project) => {
    if (filter === "all") return true;
    if (filter === "active") return project.status === "active";
    if (filter === "completed") return project.status === "completed";
    if (filter === "flagged") return project.flags && project.flags.count > 0;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-card border-b border-border px-8 py-6 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Projects</h1>
              <p className="text-muted-foreground">Manage and monitor group projects</p>
            </div>

            <div className="flex items-center gap-4">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>

              <Button asChild className="shadow-md">
                <Link to="/create">
                  <Plus className="w-5 h-5 mr-2" />
                  New Project
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-8 bg-gradient-to-br from-primary/5 to-purple-500/5">
          <QuickStats
            activeProjects={3}
            aiFlags={7}
            pendingReview={3}
            studentsOnline={12}
            upcomingDeadlines={2}
            nextDeadlineDays={3}
          />
        </div>

        {/* Project Grid */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <EnhancedProjectCard {...project} />
              </motion.div>
            ))}
            <EmptyProjectCard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
