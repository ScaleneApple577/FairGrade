import { useState } from "react";
import { User, Mail, GraduationCap, Calendar, School, BookOpen } from "lucide-react";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";

export default function StudentProfile() {
  const { user } = useAuth();
  const [dob, setDob] = useState("");
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");

  const fullName = user?.fullName || 
    `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 
    user?.email || "Student";

  const createdAt = "—";
  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <StudentPageHeader />
      <div className="px-6 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8">
            {/* Avatar & Name */}
            <div className="flex items-center gap-5 mb-8 pb-6 border-b border-white/10">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{fullName}</h1>
                <p className="text-gray-500 text-sm">Student</p>
              </div>
            </div>

            {/* Info Fields */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Full Name</p>
                  <p className="text-gray-800 text-sm">{fullName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Email Address</p>
                  <p className="text-gray-800 text-sm">{user?.email || "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Role</p>
                  <p className="text-gray-800 text-sm">Student</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Member Since</p>
                  <p className="text-gray-800 text-sm">{createdAt}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-5" />

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Date of Birth</p>
                  <Input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="bg-white/50 border-gray-200 text-gray-800 h-9 w-48"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <School className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">University / School</p>
                  <Input
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="Enter your university or school"
                    className="bg-white/50 border-gray-200 text-gray-800 placeholder:text-gray-400 h-9"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Major / Field of Study</p>
                  <Input
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="Enter your major or field of study"
                    className="bg-white/50 border-gray-200 text-gray-800 placeholder:text-gray-400 h-9"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
