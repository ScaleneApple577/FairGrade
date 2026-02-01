import { motion } from "framer-motion";
import { FileText, Shield, Users, Clock, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactNode;
  borderColor: string;
  iconBgColor: string;
  iconColor: string;
}

function StatCard({ title, value, subtitle, trend, trendUp, icon, borderColor, iconBgColor, iconColor }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card rounded-xl shadow-soft p-6 border-l-4 ${borderColor}`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={`w-10 h-10 ${iconBgColor} rounded-lg flex items-center justify-center`}>
          <div className={iconColor}>{icon}</div>
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
      {trend && (
        <p className={`text-sm flex items-center gap-1 ${trendUp ? 'text-success' : 'text-muted-foreground'}`}>
          {trendUp !== undefined && (trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />)}
          {trend}
        </p>
      )}
      {subtitle && !trend && (
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      )}
    </motion.div>
  );
}

interface QuickStatsProps {
  activeProjects: number;
  aiFlags: number;
  pendingReview: number;
  studentsOnline: number;
  upcomingDeadlines: number;
  nextDeadlineDays?: number;
}

export function QuickStats({
  activeProjects,
  aiFlags,
  pendingReview,
  studentsOnline,
  upcomingDeadlines,
  nextDeadlineDays = 3,
}: QuickStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Active Projects"
        value={activeProjects}
        trend="+1 this week"
        trendUp={true}
        icon={<FileText className="h-6 w-6" />}
        borderColor="border-primary"
        iconBgColor="bg-primary/10"
        iconColor="text-primary"
      />
      <StatCard
        title="AI Flags Today"
        value={aiFlags}
        trend={`${pendingReview} pending review`}
        trendUp={undefined}
        icon={<Shield className="h-6 w-6" />}
        borderColor="border-purple-500"
        iconBgColor="bg-purple-100 dark:bg-purple-900/30"
        iconColor="text-purple-600 dark:text-purple-400"
      />
      <StatCard
        title="Students Online"
        value={studentsOnline}
        subtitle="● Active now"
        icon={<Users className="h-6 w-6" />}
        borderColor="border-success"
        iconBgColor="bg-success/10"
        iconColor="text-success"
      />
      <StatCard
        title="Upcoming Deadlines"
        value={upcomingDeadlines}
        subtitle={`Next in ${nextDeadlineDays} days`}
        icon={<Clock className="h-6 w-6" />}
        borderColor="border-warning"
        iconBgColor="bg-warning/10"
        iconColor="text-warning"
      />
    </div>
  );
}
