import { motion } from "framer-motion";
import { Calendar, Users, Puzzle, AlertTriangle, ArrowRight, CheckCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface ProjectCardProps {
  id?: string;
  name: string;
  course: string;
  status: "active" | "completed" | "archived";
  deadline?: string;
  groupCount?: number;
  studentCount?: number;
  extensionsInstalled?: number;
  alerts?: {
    count: number;
    message: string;
  };
}

export function ProjectCard({
  id,
  name,
  course,
  status,
  deadline,
  groupCount,
  studentCount,
  extensionsInstalled,
  alerts,
}: ProjectCardProps) {
  const statusConfig = {
    active: {
      label: "Active",
      className: "bg-success/10 text-success border-success/20",
    },
    completed: {
      label: "Completed",
      className: "bg-muted text-muted-foreground border-muted",
    },
    archived: {
      label: "Archived",
      className: "bg-muted text-muted-foreground border-muted",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border shadow-soft hover:shadow-elevated transition-all duration-300 overflow-hidden"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground mb-1">{name}</h3>
            <p className="text-sm text-muted-foreground">{course}</p>
          </div>
          <Badge variant="outline" className={statusConfig[status].className}>
            {statusConfig[status].label}
          </Badge>
        </div>

        {/* Stats */}
        <div className="space-y-2 mb-4">
          {deadline && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{status === "completed" ? `Completed ${deadline}` : `Due in ${deadline}`}</span>
            </div>
          )}
          {groupCount !== undefined && studentCount !== undefined && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{groupCount} groups, {studentCount} students</span>
            </div>
          )}
          {extensionsInstalled !== undefined && studentCount !== undefined && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Puzzle className="h-4 w-4" />
              <span>{extensionsInstalled}/{studentCount} extensions installed</span>
            </div>
          )}
          {status === "completed" && (
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle className="h-4 w-4" />
              <span>All grades submitted</span>
            </div>
          )}
        </div>

        {/* Alert */}
        {alerts && alerts.count > 0 && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {alerts.count} students need attention
                </p>
                <p className="text-xs text-muted-foreground">{alerts.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action */}
        <Button variant="ghost" className="w-full justify-between group" asChild>
          <Link to={`/project/${id}`}>
            <span>{status === "completed" ? "View Archive" : "View Details"}</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}

export function EmptyProjectCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-all duration-300 overflow-hidden"
    >
      <Link to="/teacher/create" className="block p-6 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">Create New Project</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Start tracking contributions in minutes
        </p>
        <Button>Get Started</Button>
      </Link>
    </motion.div>
  );
}
