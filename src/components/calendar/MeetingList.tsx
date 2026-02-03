import { format, isToday, isTomorrow, differenceInMinutes } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  LogIn,
  LogOut,
  Video
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Attendee {
  id: string;
  name: string;
  avatar_url?: string;
  status: 'invited' | 'accepted' | 'declined';
  attended: boolean;
}

interface Meeting {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  created_by: string;
  attendees: Attendee[];
}

interface MeetingListProps {
  meetings: Meeting[];
  currentUserId: string;
  onCheckIn: (meetingId: string) => void;
  onCheckOut: (meetingId: string) => void;
  onViewDetails: (meetingId: string) => void;
  isCheckingIn?: string;
}

export function MeetingList({
  meetings,
  currentUserId,
  onCheckIn,
  onCheckOut,
  onViewDetails,
  isCheckingIn,
}: MeetingListProps) {
  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMM d');
  };

  const canCheckIn = (meeting: Meeting) => {
    const now = new Date();
    const start = new Date(meeting.start_time);
    const minutesUntil = differenceInMinutes(start, now);
    return minutesUntil <= 15 && minutesUntil >= -60; // 15 min before to 60 min after start
  };

  const isOngoing = (meeting: Meeting) => {
    const now = new Date();
    const start = new Date(meeting.start_time);
    const end = new Date(meeting.end_time);
    return now >= start && now <= end;
  };

  const getUserAttendance = (meeting: Meeting) => {
    return meeting.attendees.find(a => a.id === currentUserId);
  };

  const getAttendanceCount = (meeting: Meeting) => {
    const attending = meeting.attendees.filter(a => a.status === 'accepted' || a.attended).length;
    return `${attending}/${meeting.attendees.length}`;
  };

  const getCheckedInCount = (meeting: Meeting) => {
    const checkedIn = meeting.attendees.filter(a => a.attended).length;
    return `${checkedIn}/${meeting.attendees.length}`;
  };

  if (meetings.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No upcoming meetings</p>
        <p className="text-sm text-muted-foreground mt-1">
          Schedule a meeting to get started
        </p>
      </div>
    );
  }

  // Group meetings by date
  const groupedMeetings = meetings.reduce((groups, meeting) => {
    const dateKey = format(new Date(meeting.start_time), 'yyyy-MM-dd');
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(meeting);
    return groups;
  }, {} as Record<string, Meeting[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedMeetings).map(([dateKey, dateMeetings]) => (
        <div key={dateKey}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            {getDateLabel(dateMeetings[0].start_time)}
          </h3>
          
          <div className="space-y-3">
            {dateMeetings.map((meeting) => {
              const ongoing = isOngoing(meeting);
              const userAttendance = getUserAttendance(meeting);
              const hasCheckedIn = userAttendance?.attended;
              const showCheckIn = canCheckIn(meeting) && !hasCheckedIn;
              const showCheckOut = ongoing && hasCheckedIn;

              return (
                <Card 
                  key={meeting.id}
                  className={cn(
                    "hover:shadow-lg transition-all cursor-pointer",
                    ongoing && "border-primary/50 bg-primary/5"
                  )}
                  onClick={() => onViewDetails(meeting.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{meeting.title}</h4>
                          {ongoing && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              Live
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(meeting.start_time), 'h:mm a')} - 
                            {format(new Date(meeting.end_time), 'h:mm a')}
                          </span>
                          
                          {meeting.location && (
                            <span className="flex items-center gap-1">
                              {meeting.location.includes('http') ? (
                                <Video className="h-3 w-3" />
                              ) : (
                                <MapPin className="h-3 w-3" />
                              )}
                              <span className="truncate max-w-[150px]">
                                {meeting.location}
                              </span>
                            </span>
                          )}
                          
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {ongoing ? getCheckedInCount(meeting) + ' checked in' : getAttendanceCount(meeting) + ' attending'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        {hasCheckedIn && (
                          <Badge variant="outline" className="text-green-400 border-green-500/30">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Checked In
                          </Badge>
                        )}
                        
                        {showCheckIn && (
                          <Button
                            size="sm"
                            onClick={() => onCheckIn(meeting.id)}
                            disabled={isCheckingIn === meeting.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <LogIn className="h-3 w-3 mr-1" />
                            {isCheckingIn === meeting.id ? 'Checking...' : 'Check In'}
                          </Button>
                        )}
                        
                        {showCheckOut && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onCheckOut(meeting.id)}
                          >
                            <LogOut className="h-3 w-3 mr-1" />
                            Check Out
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Attendee avatars */}
                    <div className="flex items-center mt-3 -space-x-2">
                      {meeting.attendees.slice(0, 5).map((attendee, idx) => (
                        <div
                          key={attendee.id}
                          className={cn(
                            "w-7 h-7 rounded-full border-2 border-card flex items-center justify-center text-xs font-medium",
                            attendee.attended 
                              ? "bg-green-600 text-white" 
                              : attendee.status === 'accepted'
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                          )}
                          title={attendee.name}
                        >
                          {attendee.name.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {meeting.attendees.length > 5 && (
                        <div className="w-7 h-7 rounded-full border-2 border-card bg-muted flex items-center justify-center text-xs">
                          +{meeting.attendees.length - 5}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
