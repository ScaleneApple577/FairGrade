import { Settings } from "lucide-react";
import { StudentLayout } from "@/components/student/StudentLayout";

export default function StudentSettings() {
  return (
    <StudentLayout pageTitle="Settings">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl p-6 text-center shadow-sm">
          <Settings className="w-6 h-6 text-gray-300 mx-auto mb-3" />
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Settings</h2>
          <p className="text-xs text-gray-500">Settings options coming soon.</p>
        </div>
      </div>
    </StudentLayout>
  );
}
