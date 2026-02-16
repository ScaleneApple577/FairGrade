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
    <div className="gc-card p-5">
      <p className="text-sm text-[#5f6368] mb-3">Share this code with your students</p>
      <div className="flex items-center gap-4">
        <code className="text-2xl font-mono tracking-wider text-[#202124] font-medium select-all">
          {code}
        </code>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="text-[#1a73e8]">
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleRegenerate} disabled={regenerating} className="text-[#5f6368]">
          {regenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Regenerate
        </Button>
      </div>
    </div>
  );
}
