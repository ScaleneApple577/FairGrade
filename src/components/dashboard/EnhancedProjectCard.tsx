import { motion } from "framer-motion";
import { Calendar, Users, Flag, CheckCircle, Play, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface FlagAlert {
  count: number;
  aiDetected: number;
  plagiarism: number;
}

interface EnhancedProjectCardProps {
  id: string;
  name: string;
  course: string;
  status: "active" | "completed" | "archived";
  deadline?: string;
  deadlineDate?: string;
  groupCount: number;
  studentCount: number;
  onlineNow?: number;
  eventsToday?: number;
  flags?: FlagAlert;
}

export function EnhancedProjectCard({
  id,
  name,
  course,
  status,
  deadline,
  deadlineDate,
  groupCount,
  studentCount,
  onlineNow = 0,
  eventsToday = 0,
  flags,
}: EnhancedProjectCardProps) {
  const hasFlags = flags && flags.count > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card rounded-xl shadow-soft hover:shadow-elevated transition-all duration-300 overflow-hidden ${
        hasFlags ? 'border-l-4 border-l-destructive border border-border' : 'border border-border'
      }`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">{name}</h3>
            <p className="text-sm text-muted-foreground">{course}</p>
          </div>
          <Badge 
            variant="outline" 
            className={status === "active" 
              ? "bg-success/10 text-success border-success/20" 
              : "bg-muted text-muted-foreground"
            }
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>

        {/* Flag Alert */}
        {hasFlags && (
          <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <Flag className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-destructive">{flags.count} New Flags</p>
                <p className="text-xs text-destructive/80">
                  {flags.aiDetected > 0 && `${flags.aiDetected} AI detected`}
                  {flags.aiDetected > 0 && flags.plagiarism > 0 && ', '}
                  {flags.plagiarism > 0 && `${flags.plagiarism} plagiarism`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* No Issues Badge */}
        {!hasFlags && status === "active" && (
          <div className="bg-success/10 border-l-4 border-success rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <p className="text-sm font-semibold text-success">No flags • All clear</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="space-y-2 mb-4">
          {deadline && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                Due in <strong className="text-foreground">{deadline}</strong>
                {deadlineDate && ` (${deadlineDate})`}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{groupCount} groups, {studentCount} students</span>
          </div>

          {status === "active" && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-success">● {onlineNow} online now</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{eventsToday} events today</span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button asChild className="gap-1">
            <Link to={`/project/${id}/timeline`}>
              <Play className="w-4 h-4" />
              Timeline
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/project/${id}`}>
              View Details
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export function EmptyProjectCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors"
    >
      <Link to="/teacher/create" className="block p-8 text-center h-full flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Plus className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-foreground">Create New Project</h3>
        <p className="text-sm text-muted-foreground mb-4">Start tracking with AI detection</p>
        <Button>Get Started</Button>
      </Link>
    </motion.div>
  );
}
