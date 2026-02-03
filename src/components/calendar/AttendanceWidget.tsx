import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Calendar, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface PastMeeting {
  id: string;
  title: string;
  date: string;
  attended: boolean;
  duration_minutes?: number;
}

interface AttendanceWidgetProps {
  attendedCount: number;
  totalMeetings: number;
  pastMeetings: PastMeeting[];
}

export function AttendanceWidget({
  attendedCount,
  totalMeetings,
  pastMeetings,
}: AttendanceWidgetProps) {
  const attendanceRate = totalMeetings > 0 ? (attendedCount / totalMeetings) * 100 : 0;

  const getAttendanceColor = () => {
    if (attendanceRate >= 90) return 'text-green-400';
    if (attendanceRate >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getProgressColor = () => {
    if (attendanceRate >= 90) return 'bg-green-500';
    if (attendanceRate >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Attendance Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main stat */}
        <div className="text-center py-4">
          <div className={cn("text-4xl font-bold", getAttendanceColor())}>
            {Math.round(attendanceRate)}%
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Attended {attendedCount} of {totalMeetings} meetings
          </p>
          <div className="mt-3 w-full max-w-xs mx-auto">
            <Progress 
              value={attendanceRate} 
              className={cn("h-2", getProgressColor())}
            />
          </div>
        </div>

        {/* Trend indicator */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4 text-green-400" />
          <span className="text-green-400">+5%</span>
          <span className="text-muted-foreground">vs last month</span>
        </div>

        {/* Recent meetings */}
        {pastMeetings.length > 0 && (
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-medium mb-3">Recent Meetings</h4>
            <div className="space-y-2">
              {pastMeetings.slice(0, 5).map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-background/50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {meeting.attended ? (
                      <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                    )}
                    <span className="text-sm truncate">{meeting.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                    {format(new Date(meeting.date), 'MMM d')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {totalMeetings === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No meetings yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
