import { Settings } from "lucide-react";
import { StudentLayout } from "@/components/student/StudentLayout";

export default function StudentSettings() {
  return (
    <StudentLayout pageTitle="Settings">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/[0.03] rounded-lg p-6 text-center">
          <Settings className="w-6 h-6 text-[#8b949e]/40 mx-auto mb-3" />
          <h2 className="text-sm font-semibold text-white mb-1">Settings</h2>
          <p className="text-xs text-[#8b949e]">Settings options coming soon.</p>
        </div>
      </div>
    </StudentLayout>
  );
}
