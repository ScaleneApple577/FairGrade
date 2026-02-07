import { useState } from "react";
import { X, Mail, Plus, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface InviteStudentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherName: string;
  onSuccess: () => void;
}

export function InviteStudentsModal({
  open,
  onOpenChange,
  teacherName,
  onSuccess,
}: InviteStudentsModalProps) {
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [bulkInput, setBulkInput] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const addEmail = () => {
    const trimmedEmail = emailInput.trim().toLowerCase();
    if (!trimmedEmail) return;

    if (!validateEmail(trimmedEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (emails.includes(trimmedEmail)) {
      setEmailError("This email has already been added");
      return;
    }

    setEmails([...emails, trimmedEmail]);
    setEmailInput("");
    setEmailError("");
  };

  const removeEmail = (emailToRemove: string) => {
    setEmails(emails.filter((e) => e !== emailToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmail();
    }
  };

  const addBulkEmails = () => {
    const rawEmails = bulkInput
      .split(/[,\n]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0);

    let validCount = 0;
    let invalidCount = 0;

    rawEmails.forEach((email) => {
      if (validateEmail(email) && !emails.includes(email)) {
        setEmails((prev) => [...prev, email]);
        validCount++;
      } else if (!validateEmail(email)) {
        invalidCount++;
      }
    });

    setBulkInput("");
    if (invalidCount > 0) {
      toast.error(`${invalidCount} invalid email(s) were skipped`);
    }
    if (validCount > 0) {
      toast.success(`${validCount} email(s) added`);
    }
  };

  const handleSendInvitations = async () => {
    if (emails.length === 0) return;

    setIsSending(true);
    try {
      // TODO: POST /api/teacher/students/invite
      const result = await api.post("/api/teacher/students/invite", {
        emails,
        message: customMessage || undefined,
      });

      // Expected response: { sent: number, failed: number, already_registered: number, new_invites: number }
      const { sent, failed, already_registered, new_invites } = result;

      if (failed > 0) {
        toast.warning(
          `${sent} of ${emails.length} invitations sent. ${failed} failed.`
        );
      } else {
        toast.success(
          `✅ Invitations sent! ${new_invites} new invitations sent${
            already_registered > 0
              ? `, ${already_registered} students already registered and added to your classroom.`
              : "."
          }`
        );
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
    setEmailInput("");
    setBulkInput("");
    setCustomMessage("");
    setEmailError("");
    setIsMessageOpen(false);
    setIsPreviewOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-bold">
            Invite Students
          </DialogTitle>
          <p className="text-slate-400 text-sm mt-1">
            Send email invitations to add students to your classroom
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Email input section */}
          <div>
            <label className="text-slate-300 text-sm font-medium mb-2 block">
              Student Email Addresses
            </label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email address..."
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setEmailError("");
                }}
                onKeyDown={handleKeyDown}
                className="bg-white/10 border-white/10 text-white rounded-xl px-4 py-3 flex-1 text-sm placeholder:text-slate-500"
              />
              <Button
                onClick={addEmail}
                className="bg-blue-500/15 text-blue-400 px-4 py-3 rounded-xl text-sm font-medium hover:bg-blue-500/25"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {emailError && (
              <p className="text-red-400 text-xs mt-1">{emailError}</p>
            )}
          </div>

          {/* Added emails list */}
          {emails.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {emails.map((email) => (
                <div
                  key={email}
                  className="bg-white/10 border border-white/10 rounded-full px-3 py-1.5 text-white text-sm flex items-center gap-2"
                >
                  <span>{email}</span>
                  <button
                    onClick={() => removeEmail(email)}
                    className="text-slate-400 hover:text-white text-xs cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bulk paste option */}
          <div>
            <p className="text-slate-500 text-xs mb-2">
              Or paste multiple emails (comma or newline separated)
            </p>
            <Textarea
              placeholder="email1@school.edu, email2@school.edu..."
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              className="bg-white/10 border-white/10 text-white rounded-xl px-4 py-3 w-full text-sm min-h-[80px] placeholder:text-slate-500"
            />
            <Button
              onClick={addBulkEmails}
              disabled={!bulkInput.trim()}
              className="bg-white/10 text-slate-300 px-3 py-1.5 rounded-lg text-xs hover:bg-white/15 mt-2"
            >
              Add All
            </Button>
          </div>

          {/* Custom message */}
          <Collapsible open={isMessageOpen} onOpenChange={setIsMessageOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 text-slate-400 text-sm cursor-pointer hover:text-slate-300">
              {isMessageOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              Add a personal message (optional)
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <Textarea
                placeholder="Add a message that will be included in the invitation email..."
                value={customMessage}
                onChange={(e) =>
                  setCustomMessage(e.target.value.slice(0, 300))
                }
                className="bg-white/10 border-white/10 text-white rounded-xl px-4 py-3 w-full text-sm min-h-[60px] placeholder:text-slate-500"
              />
              <p className="text-slate-500 text-xs text-right mt-1">
                {customMessage.length} / 300
              </p>
            </CollapsibleContent>
          </Collapsible>

          {/* Email preview */}
          <Collapsible open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 text-slate-400 text-xs cursor-pointer hover:text-slate-300">
              {isPreviewOpen ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
              Preview invitation email
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                <p className="text-slate-400 text-xs mb-1">From: FairGrade</p>
                <p className="text-slate-300 text-sm mb-2">
                  Subject: {teacherName} has invited you to join their classroom
                  on FairGrade
                </p>
                <div className="border-t border-white/10 pt-3 space-y-2">
                  <p className="text-slate-400 text-xs">Hi [Student],</p>
                  <p className="text-slate-400 text-xs">
                    {teacherName} has invited you to join their classroom on
                    FairGrade — a platform that tracks and evaluates individual
                    contributions in group projects.
                  </p>
                  {customMessage && (
                    <p className="text-slate-300 text-xs italic">
                      "{customMessage}"
                    </p>
                  )}
                  <p className="text-slate-400 text-xs">
                    Click the button below to accept the invitation and get
                    started.
                  </p>
                  <div className="bg-blue-500 text-white text-xs px-3 py-1.5 rounded inline-block">
                    Accept Invitation
                  </div>
                  <p className="text-slate-500 text-xs">
                    If you already have a FairGrade account, you'll be added
                    automatically. If not, you'll be asked to create one.
                  </p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
            className="text-slate-400 hover:text-white text-sm"
          >
            Cancel
          </button>
          <Button
            onClick={handleSendInvitations}
            disabled={emails.length === 0 || isSending}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
