import { useEffect, useState } from "react";

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
import { Megaphone, Download, Loader2, Trash2, Plus } from "lucide-react";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import { isImageFile } from "@/components/utils/initials";

import { useGetCurrentUserQuery } from "../api/AuthApi";
import {
  useGetGlobalNoticesQuery,
  useCreateGlobalNoticeMutation,
  useDeleteGlobalNoticeMutation,
  useMarkGlobalNoticesViewedMutation,
} from "../api/GlobalNoticeApi";

type AutoDeleteOption = "never" | "1d" | "3d" | "1w" | "2w" | "1m" | "custom";

export default function GlobalNotices() {
  const { data: currentUser } = useGetCurrentUserQuery();
  const {
    data: notices,
    isLoading,
    refetch,
  } = useGetGlobalNoticesQuery(undefined);

  const [createNotice, { isLoading: isPosting }] =
    useCreateGlobalNoticeMutation();
  const [deleteNotice] = useDeleteGlobalNoticeMutation();
  const [markViewed] = useMarkGlobalNoticesViewedMutation();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const isAdmin = currentUser?.role === "Admin";

  // Mark everything as read the moment this page is visited
  useEffect(() => {
    markViewed();
  }, [markViewed]);

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

  const computeAutoDeleteAt = (): string | null => {
    const now = new Date();

    switch (autoDeleteOption) {
      case "never":
        return null;
      case "1d":
        now.setDate(now.getDate() + 1);
        return now.toISOString();
      case "3d":
        now.setDate(now.getDate() + 3);
        return now.toISOString();
      case "1w":
        now.setDate(now.getDate() + 7);
        return now.toISOString();
      case "2w":
        now.setDate(now.getDate() + 14);
        return now.toISOString();
      case "1m":
        now.setMonth(now.getMonth() + 1);
        return now.toISOString();
      case "custom":
        return autoDeleteCustom
          ? new Date(autoDeleteCustom).toISOString()
          : null;
      default:
        return null;
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      setFormError("Title is required.");
      return;
    }

    if (!content.trim() && !file) {
      setFormError("Add a message or attach a file.");
      return;
    }

    if (autoDeleteOption === "custom" && !autoDeleteCustom) {
      setFormError("Pick an auto-delete date, or choose a different option.");
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

    const autoDeleteAt = computeAutoDeleteAt();
    if (autoDeleteAt) {
      formData.append("AutoDeleteAt", autoDeleteAt);
    }

    setFormError(null);

    try {
      await createNotice(formData).unwrap();
      await refetch();
      // Push our own "last viewed" timestamp forward so the notice we just
      // posted never shows up as unread activity for ourselves.
      markViewed();
      setOpen(false);
      resetForm();
    } catch {
      setFormError("Couldn't post announcement. Try again.");
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);

    try {
      await deleteNotice(id).unwrap();
      await refetch();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout activeMenu="Announcements">
      <div className="mx-auto max-w-3xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <Megaphone className="h-6 w-6 text-amber-500" />
              Announcements
            </h1>
            <p className="text-sm text-muted-foreground">
              Sent to every teacher and student, regardless of group.
            </p>
          </div>

          {isAdmin && (
            <Dialog
              open={open}
              onOpenChange={(next) => {
                setOpen(next);
                if (!next) resetForm();
              }}
            >
              <DialogTrigger
                type="button"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                New announcement
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Post a global announcement</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notice-title">Title</Label>
                    <Input
                      id="notice-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. School closed Friday"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notice-content">Message</Label>
                    <Textarea
                      id="notice-content"
                      rows={4}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write the announcement..."
                      className="whitespace-pre-wrap break-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notice-file">Attachment (optional)</Label>
                    <input
                      id="notice-file"
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notice-auto-delete">Auto-delete</Label>
                    <Select
                      value={autoDeleteOption}
                      onValueChange={(v) =>
                        setAutoDeleteOption(v as AutoDeleteOption)
                      }
                    >
                      <SelectTrigger id="notice-auto-delete" className="w-full">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="never">Never</SelectItem>
                        <SelectItem value="1d">After 1 day</SelectItem>
                        <SelectItem value="3d">After 3 days</SelectItem>
                        <SelectItem value="1w">After 1 week</SelectItem>
                        <SelectItem value="2w">After 2 weeks</SelectItem>
                        <SelectItem value="1m">After 1 month</SelectItem>
                        <SelectItem value="custom">Custom date</SelectItem>
                      </SelectContent>
                    </Select>

                    {autoDeleteOption === "custom" && (
                      <Input
                        type="datetime-local"
                        value={autoDeleteCustom}
                        onChange={(e) => setAutoDeleteCustom(e.target.value)}
                      />
                    )}
                  </div>

                  {formError && (
                    <p className="text-sm text-destructive">{formError}</p>
                  )}
                </div>

                <DialogFooter>
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
                  >
                    {isPosting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Publish to everyone
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading announcements...
          </div>
        )}

        {!isLoading && (!notices || notices.length === 0) && (
          <div className="rounded-lg border border-dashed py-16 text-center">
            <Megaphone className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="font-medium">No announcements yet</p>
            <p className="text-sm text-muted-foreground">
              {isAdmin
                ? "Post one and it'll reach every teacher and student instantly."
                : "Check back later for school-wide announcements."}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {notices?.map((notice: any) => (
            <div
              key={notice.id}
              className="overflow-hidden rounded-lg border bg-muted/30 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
                    <Megaphone className="h-4 w-4 text-amber-600" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="break-words font-medium leading-tight">
                      {notice.title}
                    </p>

                    {notice.content && (
                      <p className="mt-1 whitespace-pre-wrap break-words text-sm text-muted-foreground">
                        {notice.content}
                      </p>
                    )}

                    {notice.fileName && (
                      <a
                        href={`https://localhost:7014/api/GlobalNotices/${notice.id}/download`}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        {notice.originalFileName || "Download attachment"}
                      </a>
                    )}

                    <p className="mt-2 text-xs text-muted-foreground">
                      {notice.postedByName} ·{" "}
                      {new Date(notice.postedAt).toLocaleString()}
                    </p>

                    {notice.autoDeleteAt && (
                      <p className="mt-0.5 text-[11px] italic text-muted-foreground">
                        Auto-deletes on{" "}
                        {new Date(notice.autoDeleteAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {isAdmin && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(notice.id)}
                    disabled={deletingId === notice.id}
                    aria-label="Delete announcement"
                  >
                    {deletingId === notice.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
