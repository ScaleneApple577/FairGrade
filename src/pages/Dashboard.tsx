import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ProjectCard, EmptyProjectCard } from "@/components/dashboard/ProjectCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for demo
const mockProjects = [
  {
    id: "1",
    name: "CS 101 Final Project",
    course: "Computer Science 101",
    status: "active" as const,
    deadline: "12 days (March 15)",
    groupCount: 5,
    studentCount: 20,
    extensionsInstalled: 18,
    alerts: {
      count: 2,
      message: "Extensions not installed",
    },
  },
  {
    id: "2",
    name: "MATH 250 Midterm",
    course: "Mathematics 250",
    status: "completed" as const,
    deadline: "Feb 15",
    groupCount: 3,
    studentCount: 12,
    extensionsInstalled: 12,
  },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = mockProjects.filter((project) => {
    if (activeTab === "all") return true;
    return project.status === activeTab;
  });

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">My Projects</h1>
              <p className="text-muted-foreground">Manage and monitor group projects</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button asChild>
                <Link to="/create">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Link>
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Projects</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ProjectCard {...project} />
            </motion.div>
          ))}
          <EmptyProjectCard />
        </div>
      </div>
    </DashboardLayout>
  );
}
