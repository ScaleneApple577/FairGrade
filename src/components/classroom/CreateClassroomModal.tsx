import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface CreateClassroomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (classroom: { id: string; name: string }) => void;
}

export function CreateClassroomModal({ open, onOpenChange, onSuccess }: CreateClassroomModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await api.post<{ id: string; name: string; join_code: string }>("/api/classrooms", { name: name.trim() });
      toast({ title: "Classroom created!", description: `Join code: ${res.join_code}` });
      setName("");
      onOpenChange(false);
      onSuccess(res);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#202124]">Create Classroom</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Classroom name"
            className="text-[#202124]"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!name.trim() || loading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
