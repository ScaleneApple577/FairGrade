import { useState } from "react";
import { Copy, Check, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JoinCodeCardProps {
  code: string;
  onRegenerate: () => Promise<void>;
}

export function JoinCodeCard({ code, onRegenerate }: JoinCodeCardProps) {
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await onRegenerate();
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="gc-card p-4">
      <p className="text-xs text-muted-foreground mb-2">Share this code with your students</p>
      <div className="flex items-center gap-3">
        <code className="text-lg font-mono tracking-wider text-foreground font-medium select-all">
          {code}
        </code>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="text-primary">
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleRegenerate} disabled={regenerating} className="text-muted-foreground">
          {regenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Regenerate
        </Button>
      </div>
    </div>
  );
}
