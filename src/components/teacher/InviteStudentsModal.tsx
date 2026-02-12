import { useState, useRef, useCallback } from "react";
import { X, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface InviteStudentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherName: string;
  classroomId?: number | string;
  classroomName?: string;
  onSuccess: () => void;
}

const EMAIL_DOMAINS = [".com", ".edu", ".net", ".org", ".io", ".co", ".dev", ".me", ".us", ".uk", ".ca", ".au"];

export function InviteStudentsModal({
  open,
  onOpenChange,
  teacherName,
  classroomId,
  classroomName,
  onSuccess,
}: InviteStudentsModalProps) {
  const [inputValue, setInputValue] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const validateEmailDomain = (email: string): boolean => {
    const lower = email.trim().toLowerCase();
    if (lower.endsWith("@gmail.com")) return true;
    // Match .edu or .edu.xx
    if (/\.edu(\.[a-z]{2,})?$/.test(lower)) return true;
    return false;
  };

  const addEmail = useCallback((raw: string) => {
    const email = raw.trim().toLowerCase().replace(/[,;\s]+$/, "");
    if (!email) return false;
    if (!validateEmail(email)) return false;
    if (!validateEmailDomain(email)) {
      setEmailError("Only @gmail.com and .edu email addresses are accepted.");
      return false;
    }
    setEmailError(null);
    if (emails.includes(email)) return false;
    setEmails((prev) => [...prev, email]);
    return true;
  }, [emails]);

  const tryConvertToPill = useCallback((value: string) => {
    // Check if the current input ends with a recognized email domain
    const trimmed = value.trim().toLowerCase();
    for (const domain of EMAIL_DOMAINS) {
      if (trimmed.endsWith(domain)) {
        if (addEmail(trimmed)) {
          setInputValue("");
          return true;
        }
      }
    }
    return false;
  }, [addEmail]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    // Auto-detect complete emails
    tryConvertToPill(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      if (addEmail(inputValue)) {
        setInputValue("");
      }
    }
    if (e.key === "Backspace" && !inputValue && emails.length > 0) {
      setEmails((prev) => prev.slice(0, -1));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const parts = pasted.split(/[,;\n\r\s]+/).filter(Boolean);
    let added = 0;
    parts.forEach((part) => {
      if (addEmail(part)) added++;
    });
    if (added > 0) {
      toast.success(`${added} email(s) added`);
    }
  };

  const removeEmail = (email: string) => {
    setEmails((prev) => prev.filter((e) => e !== email));
  };

  const handleSendInvitations = async () => {
    if (emails.length === 0) return;
    if (!classroomId) {
      toast.error("Please select a classroom first");
      return;
    }

    setIsSending(true);
    try {
      const result = await api.post(`/api/classrooms/${classroomId}/invite`, {
        emails,
      });

      const invited = result.invited || emails.length;
      toast.success(`✅ ${invited} invitation(s) sent!`);
      if (result.skipped > 0) {
        toast.info(`${result.skipped} skipped (already invited)`);
      }

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Failed to send invitations:", error);
      toast.error("Failed to send invitations. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    setEmails([]);
    setInputValue("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-bold">
            Invite Students{classroomName ? ` to ${classroomName}` : ""}
          </DialogTitle>
          <p className="text-slate-400 text-sm mt-1">
            Type or paste email addresses to invite students
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Email pill input */}
          <div>
            <label className="text-slate-300 text-sm font-medium mb-2 block">
              Student Email Addresses
            </label>
            <div
              className="flex flex-wrap items-center gap-2 min-h-[48px] p-3 bg-white/10 border border-white/10 rounded-xl cursor-text"
              onClick={() => inputRef.current?.focus()}
            >
              {emails.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-full px-3 py-1 text-sm"
                >
                  {email}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeEmail(email);
                    }}
                    className="text-blue-400 hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder={emails.length === 0 ? "Enter email addresses..." : ""}
                className="flex-1 min-w-[150px] bg-transparent border-none outline-none text-white placeholder:text-slate-500 text-sm"
              />
            </div>
            {emailError && (
              <p className="text-red-400 text-xs mt-2">{emailError}</p>
            )}
            <p className="text-slate-500 text-xs mt-2">
              Press Enter, comma, or space to add. Paste multiple emails separated by commas or newlines.
            </p>
          </div>

          {/* Send button */}
          <Button
            onClick={handleSendInvitations}
            disabled={emails.length === 0 || isSending}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send Invitations{emails.length > 0 ? ` (${emails.length})` : ""}
              </>
            )}
          </Button>

          <p className="text-slate-500 text-xs text-center">
            Students will receive an email invitation to join your classroom
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
