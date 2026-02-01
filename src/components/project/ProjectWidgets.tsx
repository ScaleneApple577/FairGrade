import { Users, UserCheck, TrendingUp, Calendar, AlertTriangle, Clock, Info } from "lucide-react";
import { motion } from "framer-motion";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: "users" | "groups" | "contribution" | "days";
  trend?: "up" | "down" | "neutral";
}

const iconMap = {
  users: Users,
  groups: UserCheck,
  contribution: TrendingUp,
  days: Calendar,
};

const iconBgMap = {
  users: "bg-primary/10 text-primary",
  groups: "bg-warning/10 text-warning",
  contribution: "bg-success/10 text-success",
  days: "bg-destructive/10 text-destructive",
};

export function MetricCard({ title, value, subtitle, icon }: MetricCardProps) {
  const Icon = iconMap[icon];
  const bgClass = iconBgMap[icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border p-6 shadow-soft"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className={`w-10 h-10 rounded-lg ${bgClass} flex items-center justify-center`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{subtitle}</div>
    </motion.div>
  );
}

interface AlertItemProps {
  type: "warning" | "danger" | "info";
  title: string;
  description: string;
  time: string;
  actions?: { label: string; variant: "primary" | "secondary" }[];
}

const alertConfig = {
  warning: {
    bg: "bg-warning/10 border-warning/20",
    iconBg: "bg-warning/20",
    icon: AlertTriangle,
    iconColor: "text-warning",
  },
  danger: {
    bg: "bg-destructive/10 border-destructive/20",
    iconBg: "bg-destructive/20",
    icon: AlertTriangle,
    iconColor: "text-destructive",
  },
  info: {
    bg: "bg-primary/10 border-primary/20",
    iconBg: "bg-primary/20",
    icon: Info,
    iconColor: "text-primary",
  },
};

export function AlertItem({ type, title, description, time, actions }: AlertItemProps) {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <div className={`rounded-lg border p-4 ${config.bg}`}>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-full ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-foreground mb-1">{title}</h4>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          {actions && (
            <div className="flex flex-wrap gap-2">
              {actions.map((action) => (
                <button
                  key={action.label}
                  className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                    action.variant === "primary"
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">{time}</span>
      </div>
    </div>
  );
}

interface ActivityItemProps {
  avatar: string;
  name: string;
  action: string;
  target: string;
  details: string;
  time: string;
  color?: string;
}

export function ActivityItem({ avatar, name, action, target, details, time, color = "bg-primary" }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-4 py-4">
      <div className="relative">
        <div className="w-0.5 h-full bg-border absolute left-1/2 -translate-x-1/2 top-10" />
        <div className={`w-10 h-10 rounded-full ${color} text-primary-foreground flex items-center justify-center text-sm font-semibold relative z-10`}>
          {avatar}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">
          <span className="font-semibold">{name}</span> {action}{" "}
          <span className="font-medium text-primary">{target}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{details}</p>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">{time}</span>
    </div>
  );
}
