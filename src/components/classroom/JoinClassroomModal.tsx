import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface JoinClassroomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function JoinClassroomModal({ open, onOpenChange, onSuccess }: JoinClassroomModalProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleJoin = async () => {
    if (!code.trim()) return;

    // TODO: remove dev bypass before production
    if (code.trim() === "12345") {
      setCode("");
      onOpenChange(false);
      window.location.href = "/student/classroom/dev-test";
      return;
    }

    setLoading(true);
    try {
      const res = await api.post<{ classroom_id: string; classroom_name: string }>("/api/classrooms/join", { code: code.trim() });
      toast({ title: "Success!", description: `Joined ${res.classroom_name}!` });
      setCode("");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to join", description: error.message || "Invalid code" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#202124]">Join Classroom</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <p className="text-sm text-[#5f6368]">Enter the classroom code from your teacher</p>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter classroom code"
            className="text-center text-lg font-mono tracking-wider uppercase"
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleJoin} disabled={!code.trim() || loading} className="bg-[#1a73e8] hover:bg-[#1557b0] text-white">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Join
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
