import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, ClipboardList, Loader2, UserPlus } from "lucide-react";

import {
  AUTO_DELETE_OPTIONS,
  type AutoDeleteOption,
} from "../utils/Autodelete";
import {
  buildPostFormData,
  createEmptyPostDraft,
  validatePostDraft,
  type NewPostDraft,
} from "../utils/Postform";
import type { SubmissionModeOption } from "../utils/SubmitType";

interface CreatePostDialogProps {
  groupName: string;
  isPosting: boolean;
  onCreatePost: (formData: FormData) => Promise<boolean>;
}

export default function CreatePostDialog({
  groupName,
  isPosting,
  onCreatePost,
}: CreatePostDialogProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<NewPostDraft>(createEmptyPostDraft);
  const [formError, setFormError] = useState<string | null>(null);

  const update = <K extends keyof NewPostDraft>(
    key: K,
    value: NewPostDraft[K],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const reset = () => {
    setDraft(createEmptyPostDraft());
    setFormError(null);
  };

  const handleSubmit = async () => {
    const problem = validatePostDraft(draft);

    if (problem) {
      setFormError(problem);
      return;
    }

    setFormError(null);

    const success = await onCreatePost(buildPostFormData(draft));

    if (success) {
      setOpen(false);
      reset();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);

        if (!next) {
          reset();
        }
      }}
    >
      <DialogTrigger
        type="button"
        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-input bg-background px-3 text-xs font-medium shadow-xs transition-colors hover:bg-muted"
      >
        <UserPlus className="h-3.5 w-3.5" />
        New post
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Post to {groupName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={draft.type === "Notice" ? "default" : "outline"}
              onClick={() => update("type", "Notice")}
            >
              <Bell className="mr-1.5 h-3.5 w-3.5" />
              Notice
            </Button>

            <Button
              type="button"
              size="sm"
              variant={draft.type === "Assignment" ? "default" : "outline"}
              onClick={() => update("type", "Assignment")}
            >
              <ClipboardList className="mr-1.5 h-3.5 w-3.5" />
              Assignment
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="post-title">Title</Label>
            <Input
              id="post-title"
              value={draft.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder={
                draft.type === "Notice"
                  ? "e.g. Exam schedule"
                  : "e.g. Chapter 4 worksheet"
              }
              className="w-full max-w-full"
            />
          </div>

          {draft.type === "Notice" && (
            <div className="space-y-2">
              <Label htmlFor="post-content">Message</Label>
              <Textarea
                id="post-content"
                rows={4}
                value={draft.content}
                onChange={(e) => update("content", e.target.value)}
                placeholder="Write the notice..."
                className="w-full max-w-full whitespace-pre-wrap break-all"
              />
            </div>
          )}

          {draft.type === "Assignment" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="post-content">Instructions (optional)</Label>
                <Textarea
                  id="post-content"
                  rows={3}
                  value={draft.content}
                  onChange={(e) => update("content", e.target.value)}
                  placeholder="Any notes about the assignment..."
                  className="w-full max-w-full whitespace-pre-wrap break-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="post-due-date">Due date (optional)</Label>
                <Input
                  id="post-due-date"
                  type="datetime-local"
                  value={draft.dueDate}
                  onChange={(e) => update("dueDate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="post-submission-mode">Submission method</Label>
                <Select
                  value={draft.submissionMode}
                  onValueChange={(v) =>
                    update("submissionMode", v as SubmissionModeOption)
                  }
                >
                  <SelectTrigger id="post-submission-mode" className="w-full">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Physical">
                      Physical (in notebook/copy)
                    </SelectItem>
                    <SelectItem value="Online">Online only</SelectItem>
                    <SelectItem value="Both">Physical or online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="post-file">
              {draft.type === "Assignment" ? "File" : "Attachment (optional)"}
            </Label>
            <input
              id="post-file"
              type="file"
              onChange={(e) => update("file", e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="post-auto-delete">Auto-delete</Label>
            <Select
              value={draft.autoDeleteOption}
              onValueChange={(v) =>
                update("autoDeleteOption", v as AutoDeleteOption)
              }
            >
              <SelectTrigger id="post-auto-delete" className="w-full">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {AUTO_DELETE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {draft.autoDeleteOption === "custom" && (
              <Input
                type="datetime-local"
                value={draft.autoDeleteCustom}
                onChange={(e) => update("autoDeleteCustom", e.target.value)}
              />
            )}
          </div>

          {formError && <p className="text-sm text-destructive">{formError}</p>}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            type="button"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          <Button type="button" onClick={handleSubmit} disabled={isPosting}>
            {isPosting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}