
import { useState } from "react";
import { Loader2, Sparkles, Plus } from "lucide-react";

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

import {
  AUTO_DELETE_OPTIONS,
  computeAutoDeleteAt,
  type AutoDeleteOption,
} from "@/components/utils/Autodelete";

interface CreateNoticeDialogProps {
  isPosting: boolean;
  onCreate: (formData: FormData) => Promise<boolean>;
}

export default function CreateNoticeDialog({
  isPosting,
  onCreate,
}: CreateNoticeDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [autoDeleteOption, setAutoDeleteOption] =
    useState<AutoDeleteOption>("never");

  const [autoDeleteCustom, setAutoDeleteCustom] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setFile(null);
    setAutoDeleteOption("never");
    setAutoDeleteCustom("");
    setFormError(null);
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      setFormError("Title is required.");
      return;
    }

    if (!content.trim() && !file) {
      setFormError("Please add a message or attach a file.");
      return;
    }

    if (autoDeleteOption === "custom" && !autoDeleteCustom) {
      setFormError(
        "Pick an auto-delete date, or choose a different option."
      );
      return;
    }

    const formData = new FormData();

    formData.append("Title", title.trim());

    if (content.trim()) {
      formData.append("Content", content.trim());
    }

    if (file) {
      formData.append("File", file);
    }

    const autoDeleteAt = computeAutoDeleteAt(
      autoDeleteOption,
      autoDeleteCustom
    );

    if (autoDeleteAt) {
      formData.append("AutoDeleteAt", autoDeleteAt);
    }

    setFormError(null);

    const success = await onCreate(formData);

    if (success) {
      setOpen(false);
      resetForm();
    } else {
      setFormError(
        "Couldn't post announcement. Please try again."
      );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);

        if (!next) {
          resetForm();
        }
      }}
    >
      {/* Corrected DialogTrigger */}
      <DialogTrigger
        render={
          <Button className="gap-2 bg-emerald-600 text-white shadow-sm hover:bg-emerald-700" />
        }
      >
        <Plus className="h-4 w-4" />
        Post Announcement
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            New Campus Announcement
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="notice-title">
              Notice Title *
            </Label>

            <Input
              id="notice-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Annual Sports Day 2026 Schedule"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notice-content">
              Announcement Body
            </Label>

            <Textarea
              id="notice-content"
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type the announcement details here..."
              className="whitespace-pre-wrap break-words"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notice-file">
              Attachment (PDF, Document, or Image)
            </Label>

            <Input
              id="notice-file"
              type="file"
              onChange={(e) =>
                setFile(e.target.files?.[0] ?? null)
              }
              className="cursor-pointer file:cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notice-auto-delete">
              Auto-Expire Notice
            </Label>

            <Select
              value={autoDeleteOption}
              onValueChange={(v) =>
                setAutoDeleteOption(v as AutoDeleteOption)
              }
            >
              <SelectTrigger id="notice-auto-delete">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {AUTO_DELETE_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {autoDeleteOption === "custom" && (
              <Input
                type="datetime-local"
                value={autoDeleteCustom}
                onChange={(e) =>
                  setAutoDeleteCustom(e.target.value)
                }
                className="mt-2"
              />
            )}
          </div>

          {formError && (
            <p className="rounded-md bg-destructive/10 p-2 text-xs font-medium text-destructive">
              {formError}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 pt-3 sm:gap-0">
          <Button
            variant="outline"
            type="button"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleCreate}
            disabled={isPosting}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {isPosting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}

            Broadcast Notice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}