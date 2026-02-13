import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { FileText, Play, ChevronDown, MessageSquare, Trash2, Palette, Upload, Activity, Loader2, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TeacherLayout } from "@/components/teacher/TeacherLayout";
import { api } from "@/lib/api";
import { useLiveStatus, ApiEvent, getActivityText, formatEventTime } from "@/hooks/useLiveStatus";
import { getGoogleFileUrl } from "@/lib/fileUtils";

// Activity display item
interface ActivityItem {
  id: string; studentName: string; studentAvatar: string; studentColor: string;
  action: string; fileName: string; fileId: string; projectId: string; projectName: string;
  timestamp: string; detail: string; googleFileUrl?: string; driveFileId?: string; mimeType?: string;
}

const actionIcons = {
  edit: FileText, edited: FileText, create: FileText, comment: MessageSquare,
  delete: Trash2, deleted: Trash2, format: Palette, formatted: Palette,
  upload: Upload, uploaded: Upload, submit: Upload, submitted: Upload,
};

const avatarColors = ["bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-orange-500", "bg-pink-500", "bg-cyan-500"];
function getAvatarColor(id: string): string { const index = parseInt(id.replace(/\D/g, ''), 10) % avatarColors.length; return avatarColors[index] || avatarColors[0]; }
function getInitials(name: string): string { return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); }

export default function TeacherLiveMonitor() {
  const navigate = useNavigate();
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [projectFilter, setProjectFilter] = useState("all");
  const [studentFilter, setStudentFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("24h");
  const { allEvents, loading: liveLoading } = useLiveStatus();

  useEffect(() => {
    const loadActivity = async () => {
      setIsLoading(true);
      try {
        const activities: ActivityItem[] = allEvents.map((event: ApiEvent) => ({
          id: event.id, studentName: event.user_name || 'Unknown', studentAvatar: getInitials(event.user_name || 'U'),
          studentColor: getAvatarColor(event.user_id || '0'), action: event.event_type,
          fileName: event.file_name || 'Unknown File', fileId: event.file_id || '', projectId: event.project_id || '',
          projectName: event.project_name || '', timestamp: formatEventTime(event.created_at), detail: getActivityText(event),
          driveFileId: (event as any).drive_file_id, mimeType: (event as any).mime_type,
        }));
        let filteredByTime = activities;
        const now = new Date();
        if (timeFilter === "1h") { const cutoff = new Date(now.getTime() - 60 * 60 * 1000); filteredByTime = activities.filter((a) => { const event = allEvents.find(e => e.id === a.id); return event && new Date(event.created_at) > cutoff; }); }
        else if (timeFilter === "24h") { const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); filteredByTime = activities.filter((a) => { const event = allEvents.find(e => e.id === a.id); return event && new Date(event.created_at) > cutoff; }); }
        else if (timeFilter === "7d") { const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); filteredByTime = activities.filter((a) => { const event = allEvents.find(e => e.id === a.id); return event && new Date(event.created_at) > cutoff; }); }
        setActivityFeed(filteredByTime);
      } catch (error) { console.error("Failed to load activity:", error); setActivityFeed([]); }
      finally { setIsLoading(false); }
    };
    if (!liveLoading) { loadActivity(); }
  }, [allEvents, liveLoading, timeFilter]);

  const projects = useMemo(() => ["All Projects", ...Array.from(new Set(activityFeed.map(a => a.projectName).filter(Boolean)))], [activityFeed]);
  const students = useMemo(() => ["All Students", ...Array.from(new Set(activityFeed.map(a => a.studentName).filter(Boolean)))], [activityFeed]);
  const timeRanges = [{ value: "1h", label: "Last Hour" }, { value: "24h", label: "Last 24 Hours" }, { value: "7d", label: "Last 7 Days" }, { value: "30d", label: "Last 30 Days" }];

  const filteredActivity = activityFeed.filter((activity) => {
    if (projectFilter !== "all" && activity.projectName !== projectFilter) return false;
    if (studentFilter !== "all" && activity.studentName !== studentFilter) return false;
    return true;
  });

  if (isLoading || liveLoading) {
    return (<TeacherLayout><div className="p-8 flex items-center justify-center min-h-[50vh]"><Loader2 className="w-5 h-5 text-blue-500 animate-spin" /></div></TeacherLayout>);
  }

  return (
    <TeacherLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="p-8">
        {/* Filter Row */}
        <div className="flex items-center gap-3 mb-6">
          {[{ value: projectFilter, setter: setProjectFilter, options: projects }, { value: studentFilter, setter: setStudentFilter, options: students }].map((f, idx) => (
            <div key={idx} className="relative">
              <select value={f.value} onChange={(e) => f.setter(e.target.value)} className="appearance-none bg-white border border-gray-200 text-gray-600 text-sm px-3 py-2 pr-8 rounded-lg shadow-sm cursor-pointer">
                {f.options.map((opt, i) => (<option key={opt} value={i === 0 ? "all" : opt}>{opt}</option>))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          ))}
          <div className="relative">
            <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="appearance-none bg-white border border-gray-200 text-gray-600 text-sm px-3 py-2 pr-8 rounded-lg shadow-sm cursor-pointer">
              {timeRanges.map((range) => (<option key={range.value} value={range.value}>{range.label}</option>))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Activity Feed */}
        {filteredActivity.length > 0 ? (
          <div className="space-y-3">
            {filteredActivity.map((activity, index) => {
              const ActionIcon = actionIcons[activity.action as keyof typeof actionIcons] || FileText;
              return (
                <motion.div key={activity.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.02 }}
                  className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all duration-150 flex items-center gap-4 shadow-sm">
                  <div className={`w-10 h-10 ${activity.studentColor} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>{activity.studentAvatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm"><span className="text-gray-900 font-medium">{activity.studentName}</span><span className="text-gray-500"> {activity.detail}</span></p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-400 text-xs">{activity.projectName}</span>
                      <span className="text-gray-300 text-xs">•</span>
                      <span className="text-gray-400 text-xs">{activity.timestamp}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {activity.driveFileId && activity.mimeType && (
                      <button onClick={() => window.open(getGoogleFileUrl(activity.driveFileId!, activity.mimeType!), "_blank")} className="flex items-center gap-1.5 text-gray-400 text-sm hover:text-gray-700 transition-colors whitespace-nowrap">
                        <span>Open</span><ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {activity.projectId && activity.fileId && (
                      <button onClick={() => navigate(`/teacher/live-replay/${activity.projectId}/${activity.fileId}`)} className="flex items-center gap-1.5 text-blue-600 text-sm hover:text-blue-700 transition-colors whitespace-nowrap">
                        <span>View Replay</span><Play className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Activity className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No recent activity</p>
            <p className="text-gray-400 text-sm mt-1">Activity will appear here when students start working</p>
          </div>
        )}
      </motion.div>
    </TeacherLayout>
  );
}
