import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AnnouncementInputProps {
  onPost: (message: string) => void;
  authorName: string;
}

export function AnnouncementInput({ onPost, authorName }: AnnouncementInputProps) {
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState("");

  const handlePost = () => {
    if (!message.trim()) return;
    onPost(message.trim());
    setMessage("");
    setExpanded(false);
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="gc-card w-full p-4 flex items-center gap-3 text-left hover:shadow-md transition-shadow"
      >
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium flex-shrink-0">
          {authorName.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm text-[#5f6368]">Announce something to your class</span>
      </button>
    );
  }

  return (
    <div className="gc-card p-4">
      <textarea
        autoFocus
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Share with your class..."
        className="w-full border border-border rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none min-h-[100px]"
      />
      <div className="flex justify-end gap-2 mt-3">
        <Button variant="ghost" size="sm" onClick={() => { setExpanded(false); setMessage(""); }}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handlePost}
          disabled={!message.trim()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Post
        </Button>
      </div>
    </div>
  );
}
