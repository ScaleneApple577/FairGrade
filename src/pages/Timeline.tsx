import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Pause, SkipForward, Flag, Filter, Download, FileText, Clock, ChevronRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

interface Student {
  id: string;
  name: string;
  initials: string;
  color: string;
  eventCount: number;
  checked: boolean;
}

interface TimelineEvent {
  id: string;
  studentId: string;
  studentName: string;
  studentInitials: string;
  studentColor: string;
  eventType: "edit" | "paste" | "comment" | "meeting";
  description: string;
  timestamp: string;
  isFlagged?: boolean;
  flagDetails?: string;
}

const mockStudents: Student[] = [
  { id: "1", name: "Alice Kim", initials: "AK", color: "bg-blue-500", eventCount: 847, checked: true },
  { id: "2", name: "Bob Lee", initials: "BL", color: "bg-green-500", eventCount: 723, checked: true },
  { id: "3", name: "Charlie M.", initials: "CM", color: "bg-purple-500", eventCount: 512, checked: true },
  { id: "4", name: "David W.", initials: "DW", color: "bg-orange-500", eventCount: 287, checked: true },
];

const mockEvents: TimelineEvent[] = [
  {
    id: "1",
    studentId: "4",
    studentName: "David W.",
    studentInitials: "DW",
    studentColor: "bg-orange-500",
    eventType: "paste",
    description: "Pasted 523 chars",
    timestamp: "9:45 PM",
    isFlagged: true,
    flagDetails: "AI: 87%",
  },
  {
    id: "2",
    studentId: "3",
    studentName: "Charlie M.",
    studentInitials: "CM",
    studentColor: "bg-purple-500",
    eventType: "edit",
    description: "Added 89 chars",
    timestamp: "7:22 PM",
  },
  {
    id: "3",
    studentId: "2",
    studentName: "Bob Lee",
    studentInitials: "BL",
    studentColor: "bg-green-500",
    eventType: "comment",
    description: "Added comment",
    timestamp: "6:15 PM",
  },
  {
    id: "4",
    studentId: "1",
    studentName: "Alice Kim",
    studentInitials: "AK",
    studentColor: "bg-blue-500",
    eventType: "edit",
    description: "Edited 47 chars",
    timestamp: "4:30 PM",
  },
];

export default function Timeline() {
  const { id } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [position, setPosition] = useState(62);
  const [students, setStudents] = useState(mockStudents);
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);

  const toggleStudent = (studentId: string) => {
    setStudents(students.map(s => 
      s.id === studentId ? { ...s, checked: !s.checked } : s
    ));
  };

  const currentDate = "Feb 12, 2025 9:45 PM";

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={`/project/${id}`} className="text-gray-400 hover:text-white transition">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">CS 101 Final Project - Timeline Replay</h1>
              <p className="text-sm text-gray-400">Feb 1 - Mar 15, 2025 • 2,847 events</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
              <Download className="w-4 h-4 mr-2" />
              Export Video
            </Button>
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar - Student Filters */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter by Student
          </h3>

          <div className="space-y-2">
            {students.map((student) => (
              <label
                key={student.id}
                className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition cursor-pointer"
              >
                <Checkbox
                  checked={student.checked}
                  onCheckedChange={() => toggleStudent(student.id)}
                  className="border-gray-500"
                />
                <div className={`w-8 h-8 ${student.color} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                  {student.initials}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{student.name}</p>
                  <p className="text-gray-400 text-xs">{student.eventCount} events</p>
                </div>
              </label>
            ))}
          </div>

          <hr className="my-6 border-gray-700" />

          <h3 className="text-white font-bold mb-4">Filter by Event Type</h3>
          <div className="space-y-2">
            {["Document Edits", "Pastes", "Comments", "Meetings"].map((type) => (
              <label key={type} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white cursor-pointer">
                <Checkbox defaultChecked className="border-gray-500" />
                <span>{type}</span>
              </label>
            ))}
            <label className="flex items-center gap-2 text-sm text-destructive cursor-pointer">
              <Checkbox 
                checked={showFlaggedOnly}
                onCheckedChange={(checked) => setShowFlaggedOnly(!!checked)}
                className="border-destructive"
              />
              <span>Flagged Events Only</span>
            </label>
          </div>
        </div>

        {/* Main Timeline View */}
        <div className="flex-1 flex flex-col">
          {/* Document Preview Area */}
          <div className="flex-1 bg-gray-900 p-8 overflow-auto">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-2xl p-12 min-h-full">
              <div className="prose max-w-none">
                <h1 className="text-3xl font-bold mb-6 text-gray-900">Project Title: AI Ethics Research</h1>

                <p className="mb-4">
                  <span className="bg-blue-200 px-1" title="Added by Alice Kim - Feb 5, 2:30 PM">
                    Artificial intelligence has become increasingly prevalent in modern society,
                    raising important ethical questions about privacy, bias, and accountability.
                  </span>
                </p>

                <p className="mb-4">
                  <span className="bg-green-200 px-1" title="Added by Bob Lee - Feb 7, 4:15 PM">
                    Machine learning algorithms are trained on historical data, which may contain
                    societal biases that are then perpetuated by the AI systems.
                  </span>
                </p>

                <p className="mb-4">
                  <span className="bg-purple-200 px-1" title="Added by Charlie M. - Feb 10, 11:00 AM">
                    Several high-profile cases have demonstrated the potential for AI systems
                    to discriminate against marginalized groups.
                  </span>
                </p>

                <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6">
                  <div className="flex items-start gap-2">
                    <Flag className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-red-900">Large Paste Detected</p>
                      <p className="text-xs text-red-700">David W. pasted 523 characters - Feb 12, 9:45 PM</p>
                      <p className="text-xs text-red-600 mt-1">AI Score: 87% • Plagiarism: 23%</p>
                    </div>
                  </div>
                </div>

                <p className="mb-4 bg-orange-100 border border-orange-300 p-2">
                  <span className="bg-orange-200 px-1" title="Pasted by David W. - Feb 12, 9:45 PM - FLAGGED">
                    The deployment of facial recognition technology in public spaces has sparked
                    debates about surveillance and civil liberties. Critics argue that these
                    systems represent an unwarranted intrusion into privacy...
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Timeline Player Controls */}
          <div className="bg-gray-800 border-t border-gray-700 p-6">
            {/* Timeline Scrubber */}
            <div className="mb-4">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-white text-sm font-medium">Feb 1, 2025</span>
                <div className="flex-1 relative">
                  {/* Timeline Bar with Event Markers */}
                  <div className="h-12 bg-gray-700 rounded-lg relative overflow-hidden">
                    {/* Color-coded event segments */}
                    <div className="absolute top-0 left-0 h-full bg-blue-500 opacity-30" style={{ width: '25%' }} />
                    <div className="absolute top-0 left-1/4 h-full bg-green-500 opacity-30" style={{ width: '20%' }} />
                    <div className="absolute top-0 left-[45%] h-full bg-purple-500 opacity-30" style={{ width: '15%' }} />
                    <div className="absolute top-0 left-[60%] h-full bg-orange-500 opacity-30" style={{ width: '10%' }} />

                    {/* Flag markers */}
                    <div className="absolute top-1 left-[62%] w-1 h-10 bg-destructive" title="AI Detection Flag" />
                    <div className="absolute top-1 left-[68%] w-1 h-10 bg-destructive" title="Plagiarism Flag" />

                    {/* Current position indicator */}
                    <div 
                      className="absolute top-0 w-1 h-full bg-white shadow-lg" 
                      style={{ left: `${position}%` }}
                    />
                  </div>

                  {/* Slider overlay */}
                  <Slider
                    value={[position]}
                    onValueChange={(value) => setPosition(value[0])}
                    max={100}
                    step={1}
                    className="absolute top-0 left-0 w-full h-12 opacity-0 cursor-pointer"
                  />
                </div>
                <span className="text-white text-sm font-medium">Mar 15, 2025</span>
              </div>

              {/* Event Markers Legend */}
              <div className="flex items-center gap-4 text-xs text-gray-400">
                {mockStudents.map((student) => (
                  <div key={student.id} className="flex items-center gap-1">
                    <div className={`w-3 h-3 ${student.color} rounded`} />
                    <span>{student.name.split(' ')[0]}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1">
                  <div className="w-1 h-3 bg-destructive" />
                  <span>Flags</span>
                </div>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Play/Pause */}
                <Button
                  size="lg"
                  className="w-12 h-12 rounded-full"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </Button>

                {/* Speed Control */}
                <div className="flex items-center gap-2">
                  {[0.5, 1, 2, 5].map((speed) => (
                    <Button
                      key={speed}
                      variant={playbackSpeed === speed ? "default" : "outline"}
                      size="sm"
                      className={playbackSpeed !== speed ? "bg-gray-700 text-white border-gray-600 hover:bg-gray-600" : ""}
                      onClick={() => setPlaybackSpeed(speed)}
                    >
                      {speed}x
                    </Button>
                  ))}
                </div>

                {/* Current Time */}
                <span className="text-white text-sm font-mono flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {currentDate}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Jump to Flag */}
                <Button variant="destructive" className="gap-2">
                  <Flag className="w-4 h-4" />
                  Next Flag
                  <ChevronRight className="w-4 h-4" />
                </Button>

                {/* Heatmap View */}
                <Button variant="outline" className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
                  Heatmap View
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Event Details */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
          <h3 className="text-white font-bold mb-4">Current Event</h3>

          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Flag className="w-5 h-5 text-red-400" />
              <span className="text-red-300 font-bold text-sm">FLAGGED EVENT</span>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-400">Student:</span>
                <span className="text-white ml-2 font-medium">David Wilson</span>
              </div>
              <div>
                <span className="text-gray-400">Type:</span>
                <span className="text-white ml-2">Large Paste</span>
              </div>
              <div>
                <span className="text-gray-400">Time:</span>
                <span className="text-white ml-2">Feb 12, 9:45 PM</span>
              </div>
              <div>
                <span className="text-gray-400">Amount:</span>
                <span className="text-white ml-2">523 characters</span>
              </div>
            </div>

            <hr className="my-3 border-gray-700" />

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">AI Detection:</span>
                <span className="text-red-400 font-bold">87%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '87%' }} />
              </div>

              <div className="flex justify-between items-center mt-3">
                <span className="text-gray-400 text-sm">Plagiarism:</span>
                <span className="text-yellow-400 font-bold">23%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '23%' }} />
              </div>
            </div>

            <Button className="w-full mt-4 bg-red-600 hover:bg-red-700">
              Review Flag Details
            </Button>
          </div>

          <h3 className="text-white font-bold mb-3">Event Stream</h3>
          <div className="space-y-2 text-sm">
            {mockEvents.map((event) => (
              <div
                key={event.id}
                className={`bg-gray-700 rounded-lg p-3 border-l-4 ${
                  event.isFlagged ? 'border-destructive' : `border-${event.studentColor.replace('bg-', '')}`
                }`}
                style={{ borderLeftColor: event.isFlagged ? undefined : event.studentColor.includes('blue') ? '#3b82f6' : event.studentColor.includes('green') ? '#22c55e' : event.studentColor.includes('purple') ? '#a855f7' : '#f97316' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-6 h-6 ${event.studentColor} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                    {event.studentInitials}
                  </div>
                  <span className="text-white font-medium">{event.studentName}</span>
                </div>
                <p className="text-gray-300 text-xs mb-1">{event.description}</p>
                <p className="text-gray-500 text-xs">
                  {event.timestamp}
                  {event.isFlagged && <span className="text-destructive ml-1">• FLAGGED</span>}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
