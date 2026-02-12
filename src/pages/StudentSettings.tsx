import { Settings } from "lucide-react";
import { StudentLayout } from "@/components/student/StudentLayout";

export default function StudentSettings() {
  return (
    <StudentLayout pageTitle="Settings">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 text-center">
          <Settings className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Settings</h2>
          <p className="text-slate-400">Settings options coming soon.</p>
        </div>
      </div>
    </StudentLayout>
  );
}
