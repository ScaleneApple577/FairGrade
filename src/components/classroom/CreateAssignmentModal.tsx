import { useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  classroomId: string;
}

export function CreateAssignmentModal({ open, onOpenChange, onSuccess, classroomId }: Props) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await api.post("/api/assignments", {
        classroom_id: classroomId,
        title: title.trim(),
        description: description.trim() || undefined,
        due_date: dueDate || undefined,
      });
      toast({ title: "Assignment created!" });
      setTitle("");
      setDescription("");
      setDueDate("");
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Assignment</DialogTitle>
          <DialogDescription>Add a new assignment for your class.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Assignment title" />
          </div>
          <div>
            <Label htmlFor="desc">Description (optional)</Label>
            <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Instructions for students..." rows={3} />
          </div>
          <div>
            <Label htmlFor="dueDate">Due Date (optional)</Label>
            <Input id="dueDate" type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <Button onClick={handleCreate} disabled={!title.trim() || loading} className="w-full bg-primary hover:bg-primary/90">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}