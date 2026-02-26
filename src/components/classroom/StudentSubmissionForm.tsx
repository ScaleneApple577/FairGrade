import { useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { extractGoogleDocId } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Props {
  projectId: string;
  onSuccess: () => void;
}

export function StudentSubmissionForm({ projectId, onSuccess }: Props) {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [name, setName] = useState("My Submission");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const docId = extractGoogleDocId(url);
    if (!docId) {
      toast({ variant: "destructive", title: "Invalid URL", description: "Please paste a valid Google Docs link." });
      return;
    }
    setLoading(true);
    try {
      await api.post(`/api/projects/${projectId}/submit-file`, {
        name: name.trim() || "My Submission",
        drive_file_id: docId,
        mime_type: "application/vnd.google-apps.document",
      });
      toast({ title: "Submitted!" });
      setUrl("");
      onSuccess();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gc-card p-5 space-y-4">
      <h3 className="text-base font-medium text-[#202124]">Submit your work</h3>
      <p className="text-xs text-[#5f6368]">Paste the link to your Google Doc. Make sure sharing is set to "Anyone with the link can view".</p>
      <div>
        <Label htmlFor="doc-url">Google Doc Link</Label>
        <Input id="doc-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://docs.google.com/document/d/..." />
      </div>
      <div>
        <Label htmlFor="sub-name">Submission name</Label>
        <Input id="sub-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Submission" />
      </div>
      <Button onClick={handleSubmit} disabled={!url.trim() || loading} className="bg-primary hover:bg-primary/90">
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Submit
      </Button>
    </div>
  );
}
