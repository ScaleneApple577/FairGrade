import { Settings } from "lucide-react";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";

export default function StudentSettings() {
  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <StudentPageHeader />
      <div className="px-6 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/60 border border-gray-200 rounded-2xl p-8 text-center">
            <Settings className="w-6 h-6 text-gray-300 mx-auto mb-3" />
            <h2 className="text-sm font-semibold text-gray-800 mb-1">Settings</h2>
            <p className="text-xs text-gray-500">Settings options coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
