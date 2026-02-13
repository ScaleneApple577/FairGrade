import { Settings } from "lucide-react";
import { StudentLayout } from "@/components/student/StudentLayout";

export default function StudentSettings() {
  return (
    <StudentLayout pageTitle="Settings">
      <div className="max-w-2xl mx-auto">
        <div className="glass-card text-center">
          <Settings className="w-6 h-6 text-white/20 mx-auto mb-3" />
          <h2 className="text-sm font-semibold text-white mb-1">Settings</h2>
          <p className="text-xs text-white/40">Settings options coming soon.</p>
        </div>
      </div>
    </StudentLayout>
  );
}
