import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Bot, Calendar, Users, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Recommendation { rank: number; date: string; startTime: string; endTime: string; availableCount: number; totalMembers: number; missing: string[]; score: number; }
interface Meeting { id: string; title: string; date: string; startTime: string; endTime: string; link?: string; attendees: Array<{ id: string; name: string }>; }
interface TeamMemberStatus { id: string; name: string; hasSetAvailability: boolean; lastUpdated?: string; }

interface CalendarAISidebarProps {
  recommendations: Recommendation[];
  meetings: Meeting[];
  teamStatus: TeamMemberStatus[];
  isLoading: boolean;
  onSelectRecommendation: (rec: Recommendation) => void;
  onScheduleMeeting: (rec: Recommendation) => void;
  onQuickSet: (preset: string) => void;
  isSettingPreset: boolean;
  whiteboard?: boolean;
}

export function CalendarAISidebar({
  recommendations, meetings, teamStatus, isLoading, onSelectRecommendation, onScheduleMeeting, onQuickSet, isSettingPreset, whiteboard,
}: CalendarAISidebarProps) {
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const handleSelectRec = (rec: Recommendation) => { setSelectedRec(rec); onSelectRecommendation(rec); };
  const wb = whiteboard;

  return (
    <div className="space-y-4">
      {/* AI Recommendation Card */}
      <div className={wb ? "border-2 border-blue-400 rounded-xl p-4 bg-transparent" : "bg-white/[0.04] border border-white/10 rounded-2xl p-6"}>
        <div className="flex items-center gap-2 mb-1">
          <Bot className={`w-5 h-5 ${wb ? "text-blue-600" : "text-blue-400"}`} />
          <h3 className={`text-lg font-semibold ${wb ? "font-['Caveat'] text-[#333] text-xl" : "text-white"}`}>AI Suggested Times</h3>
        </div>
        <p className={`text-sm ${wb ? "font-['Caveat'] text-gray-400 text-base" : "text-slate-400"}`}>
          Best meeting times based on everyone's availability
        </p>

        {isLoading ? (
          <div className="py-8 flex justify-center"><Loader2 className={`w-6 h-6 animate-spin ${wb ? "text-gray-400" : "text-slate-500"}`} /></div>
        ) : recommendations.length === 0 ? (
          <div className="py-8 text-center">
            <p className={`text-sm ${wb ? "font-['Caveat'] text-gray-400 text-base" : "text-slate-500"}`}>
              Mark your availability on the calendar and ask your teammates to do the same. AI will suggest optimal meeting times once enough data is available.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {recommendations.slice(0, 5).map((rec) => (
              <button
                key={`${rec.date}-${rec.startTime}`}
                onClick={() => handleSelectRec(rec)}
                className={`w-full text-left rounded-xl p-4 transition ${
                  wb
                    ? `bg-gray-50 border ${selectedRec?.date === rec.date && selectedRec?.startTime === rec.startTime ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:bg-gray-100"}`
                    : `bg-white/[0.03] border ${selectedRec?.date === rec.date && selectedRec?.startTime === rec.startTime ? "border-blue-500 bg-blue-500/10" : "border-white/10 hover:bg-white/[0.05]"}`
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">#{rec.rank}</div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${wb ? "font-['Caveat'] text-[#333] text-base" : "text-white"}`}>{format(parseISO(rec.date), "EEEE, MMM d")}</div>
                    <div className={`text-sm ${wb ? "font-['Caveat'] text-blue-600" : "text-blue-400"}`}>{rec.startTime} – {rec.endTime}</div>
                    <div className={`text-xs mt-1 ${rec.availableCount === rec.totalMembers ? (wb ? "text-emerald-600" : "text-emerald-400") : (wb ? "text-yellow-600" : "text-yellow-400")}`}>
                      {rec.availableCount}/{rec.totalMembers} available {rec.availableCount === rec.totalMembers ? "✓" : ""}
                    </div>
                    {rec.missing.length > 0 && <div className={`text-xs mt-0.5 ${wb ? "text-gray-400" : "text-slate-500"}`}>Missing: {rec.missing.join(", ")}</div>}
                    <div className={`mt-2 h-1.5 rounded-full overflow-hidden ${wb ? "bg-gray-200" : "bg-white/10"}`}>
                      <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${rec.score}%` }} />
                    </div>
                  </div>
                </div>
              </button>
            ))}
            {selectedRec && (
              <Button onClick={() => onScheduleMeeting(selectedRec)} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium mt-3">
                <Calendar className="w-4 h-4 mr-2" />Schedule Meeting
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Upcoming Meetings */}
      <div className={wb ? "border-2 border-red-400 rounded-xl p-4 bg-transparent" : "bg-white/[0.04] border border-white/10 rounded-2xl p-5"}>
        <h3 className={`text-sm font-semibold mb-3 ${wb ? "font-['Caveat'] text-[#333] text-lg" : "text-white"}`}>Upcoming Meetings</h3>
        {meetings.length === 0 ? (
          <p className={`text-xs ${wb ? "font-['Caveat'] text-gray-400 text-sm" : "text-slate-500"}`}>No meetings scheduled yet</p>
        ) : (
          <div className="space-y-2">
            {meetings.map((meeting) => (
              <div key={meeting.id} className={wb ? "bg-gray-50 rounded-lg p-3 border border-gray-100" : "bg-white/[0.03] rounded-xl p-3"}>
                <div className={`text-sm font-medium ${wb ? "font-['Caveat'] text-[#333] text-base" : "text-white"}`}>{meeting.title}</div>
                <div className={`text-xs ${wb ? "font-['Caveat'] text-gray-400 text-sm" : "text-slate-400"}`}>
                  {format(parseISO(meeting.date), "MMM d")} • {meeting.startTime} – {meeting.endTime}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {meeting.attendees.slice(0, 3).map((a) => (
                    <div key={a.id} className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] ${wb ? "bg-gray-300 text-gray-700" : "bg-slate-600 text-white"}`}>{a.name.charAt(0)}</div>
                  ))}
                  {meeting.attendees.length > 3 && <span className={`text-xs ${wb ? "text-gray-400" : "text-slate-500"}`}>+{meeting.attendees.length - 3}</span>}
                </div>
                {meeting.link && (
                  <a href={meeting.link} target="_blank" rel="noopener noreferrer"
                    className={`text-xs mt-1 inline-flex items-center gap-1 ${wb ? "text-blue-600 hover:text-blue-700" : "text-blue-400 hover:text-blue-300"}`}>
                    Join <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Team Availability Status */}
      <div className={wb ? "border-2 border-green-400 rounded-xl p-4 bg-transparent" : "bg-white/[0.04] border border-white/10 rounded-2xl p-5"}>
        <h3 className={`text-sm font-semibold mb-3 ${wb ? "font-['Caveat'] text-[#333] text-lg" : "text-white"}`}>Team Availability Status</h3>
        {teamStatus.length === 0 ? (
          <p className={`text-xs ${wb ? "font-['Caveat'] text-gray-400 text-sm" : "text-slate-500"}`}>No team members</p>
        ) : (
          <div className="space-y-2">
            {teamStatus.map((member) => (
              <div key={member.id} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${wb ? "bg-gray-300 text-gray-700" : "bg-slate-600 text-white"}`}>{member.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs truncate ${wb ? "font-['Caveat'] text-gray-600 text-sm" : "text-slate-300"}`}>{member.name}</div>
                  {member.hasSetAvailability
                    ? <div className={`text-[10px] ${wb ? "font-['Caveat'] text-emerald-600 text-xs" : "text-emerald-400"}`}>✓ Set availability</div>
                    : <div className={`text-[10px] ${wb ? "font-['Caveat'] text-yellow-600 text-xs" : "text-yellow-400"}`}>⏳ Hasn't set availability yet</div>
                  }
                </div>
                {member.lastUpdated && <div className={`text-[10px] ${wb ? "text-gray-300" : "text-slate-600"}`}>{member.lastUpdated}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
