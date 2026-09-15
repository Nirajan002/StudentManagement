import { useCallback, useMemo, useState } from "react";

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
  Bell,
  CalendarClock,
  ClipboardList,
  Download,
  Image as ImageIcon,
  Loader2,
  Trash2,
  UserPlus,
} from "lucide-react";

import { isImageFile } from "../utils/initials";

type AutoDeleteOption = "never" | "1d" | "3d" | "1w" | "2w" | "1m" | "custom";

interface GroupPost {
  id: number;
  type: "Notice" | "Assignment";
  title: string;
  content?: string | null;
  postedAt: string;
  postedById: string;
  postedByName: string;
  dueDate?: string | null;
  fileName?: string | null;
  originalFileName?: string | null;
  autoDeleteAt?: string | null;
}

interface PostsSectionProps {
  groupId: string;
  groupName: string;
  posts: GroupPost[] | undefined;
  isLoadingPosts: boolean;
  canPost: boolean;
  isPosting: boolean;
  deletingPostId: number | null;
  currentUserId: string | undefined;
  currentUserRole: string | undefined;
  onCreatePost: (formData: FormData) => Promise<boolean>;
  onDeletePost: (postId: number) => void;
}

export default function PostsSection({
  groupId,
  groupName,
  posts,
  isLoadingPosts,
  canPost,
  isPosting,
  deletingPostId,
  currentUserId,
  currentUserRole,
  onCreatePost,
  onDeletePost,
}: PostsSectionProps) {
  const [postOpen, setPostOpen] = useState(false);
  const [postType, setPostType] = useState<"Notice" | "Assignment">("Notice");
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postFile, setPostFile] = useState<File | null>(null);
  const [postDueDate, setPostDueDate] = useState("");
  const [autoDeleteOption, setAutoDeleteOption] =
    useState<AutoDeleteOption>("never");
  const [autoDeleteCustom, setAutoDeleteCustom] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [formError, setFormError] = useState<string | null>(null);

  const sortPosts = useCallback(
    (list: GroupPost[]) => {
      const copy = [...list];

      copy.sort((a, b) => {
        const diff =
          new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime();

        return sortOrder === "newest" ? -diff : diff;
      });

      return copy;
    },
    [sortOrder]
  );

  const notices = useMemo(
    () => sortPosts((posts ?? []).filter((p) => p.type === "Notice")),
    [posts, sortPosts]
  );

  const assignments = useMemo(
    () =>
      sortPosts((posts ?? []).filter((p) => p.type === "Assignment")),
    [posts, sortPosts]
  );

  const resetPostForm = () => {
    setPostType("Notice");
    setPostTitle("");
    setPostContent("");
    setPostFile(null);
    setPostDueDate("");
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
        return autoDeleteCustom ? new Date(autoDeleteCustom).toISOString() : null;
      default:
        return null;
    }
  };

  const handleCreatePost = async () => {
    if (!postTitle.trim()) {
      setFormError("Title is required.");
      return;
    }

    if (postType === "Notice" && !postContent.trim()) {
      setFormError("Notice content is required.");
      return;
    }

    if (postType === "Assignment" && !postFile) {
      setFormError("Please attach a file for the assignment.");
      return;
    }

    if (autoDeleteOption === "custom" && !autoDeleteCustom) {
      setFormError("Pick an auto-delete date, or choose a different option.");
      return;
    }

    const formData = new FormData();

    formData.append("Type", postType);
    formData.append("Title", postTitle.trim());

    if (postContent.trim()) {
      formData.append("Content", postContent.trim());
    }

    if (postFile) {
      formData.append("File", postFile);
    }

    if (postType === "Assignment" && postDueDate) {
      formData.append("DueDate", new Date(postDueDate).toISOString());
    }

    const autoDeleteAt = computeAutoDeleteAt();

    if (autoDeleteAt) {
      formData.append("AutoDeleteAt", autoDeleteAt);
    }

    setFormError(null);

    const success = await onCreatePost(formData);

    if (success) {
      setPostOpen(false);
      resetPostForm();
    }
  };

  const renderPostItem = (post: GroupPost) => {
    const canDeletePost =
      currentUserId &&
      (currentUserRole === "Admin" || currentUserId === post.postedById);

    const isOverdue =
      post.type === "Assignment" &&
      post.dueDate &&
      new Date(post.dueDate) < new Date();

    return (
      <div
        key={post.id}
        className="overflow-hidden rounded-md border bg-muted/30 p-3"
      >
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-start gap-2.5">
            <div className="mt-0.5 shrink-0">
              {post.type === "Notice" ? (
                <Bell className="h-4 w-4 text-amber-500" />
              ) : isImageFile(post.originalFileName) ? (
                <ImageIcon className="h-4 w-4 text-blue-500" />
              ) : (
                <ClipboardList className="h-4 w-4 text-blue-500" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="break-words text-sm font-medium leading-tight">
                {post.title}
              </p>

              {post.content && (
                <p className="mt-1 whitespace-pre-wrap break-all text-sm text-muted-foreground">
                  {post.content}
                </p>
              )}

              {post.type === "Assignment" && post.dueDate && (
                <p
                  className={`mt-1 flex items-center gap-1 text-xs font-medium ${
                    isOverdue ? "text-destructive" : "text-amber-600"
                  }`}
                >
                  <CalendarClock className="h-3 w-3" />
                  Due {new Date(post.dueDate).toLocaleString()}
                </p>
              )}

              {post.fileName && (
                
                <a  href={`https://localhost:7014/api/Groups/${groupId}/posts/${post.id}/download`}
                  className="mt-2 inline-flex items-center gap-1.5 break-words text-xs font-medium text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-3.5 w-3.5 shrink-0" />
                  {post.originalFileName || "Download file"}
                </a>
              )}

              <p className="mt-2 text-xs text-muted-foreground">
                {post.postedByName} · {new Date(post.postedAt).toLocaleString()}
              </p>

              {post.autoDeleteAt && (
                <p className="mt-0.5 text-[11px] italic text-muted-foreground">
                  Auto-deletes on {new Date(post.autoDeleteAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {canDeletePost && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onDeletePost(post.id)}
              disabled={deletingPostId === post.id}
              aria-label="Delete post"
              className="shrink-0"
            >
              {deletingPostId === post.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mb-6 min-w-0 max-w-full space-y-6">
      {/* =========================
          HEADER + NEW POST + SORT
      ========================= */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">
          {notices.length + assignments.length} total post
          {notices.length + assignments.length === 1 ? "" : "s"}
        </p>

        <div className="flex items-center gap-2">
          <Select
            value={sortOrder}
            onValueChange={(v) => setSortOrder(v as "newest" | "oldest")}
          >
            <SelectTrigger size="sm" className="h-8 w-[120px] text-xs">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
            </SelectContent>
          </Select>

          {canPost && (
            <Dialog
              open={postOpen}
              onOpenChange={(next) => {
                setPostOpen(next);

                if (!next) {
                  resetPostForm();
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
                      variant={postType === "Notice" ? "default" : "outline"}
                      onClick={() => setPostType("Notice")}
                    >
                      <Bell className="mr-1.5 h-3.5 w-3.5" />
                      Notice
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant={postType === "Assignment" ? "default" : "outline"}
                      onClick={() => setPostType("Assignment")}
                    >
                      <ClipboardList className="mr-1.5 h-3.5 w-3.5" />
                      Assignment
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="post-title">Title</Label>
                    <Input
                      id="post-title"
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      placeholder={
                        postType === "Notice"
                          ? "e.g. Exam schedule"
                          : "e.g. Chapter 4 worksheet"
                      }
                      className="w-full max-w-full"
                    />
                  </div>

                  {postType === "Notice" && (
                    <div className="space-y-2">
                      <Label htmlFor="post-content">Message</Label>
                      <Textarea
                        id="post-content"
                        rows={4}
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="Write the notice..."
                        className="w-full max-w-full whitespace-pre-wrap break-all"
                      />
                    </div>
                  )}

                  {postType === "Assignment" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="post-content">
                          Instructions (optional)
                        </Label>
                        <Textarea
                          id="post-content"
                          rows={3}
                          value={postContent}
                          onChange={(e) => setPostContent(e.target.value)}
                          placeholder="Any notes about the assignment..."
                          className="w-full max-w-full whitespace-pre-wrap break-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="post-due-date">
                          Due date (optional)
                        </Label>
                        <Input
                          id="post-due-date"
                          type="datetime-local"
                          value={postDueDate}
                          onChange={(e) => setPostDueDate(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="post-file">
                      {postType === "Assignment"
                        ? "File"
                        : "Attachment (optional)"}
                    </Label>
                    <input
                      id="post-file"
                      type="file"
                      onChange={(e) =>
                        setPostFile(e.target.files?.[0] ?? null)
                      }
                      className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="post-auto-delete">
                      Auto-delete
                    </Label>
                    <Select
                      value={autoDeleteOption}
                      onValueChange={(v) =>
                        setAutoDeleteOption(v as AutoDeleteOption)
                      }
                    >
                      <SelectTrigger id="post-auto-delete" className="w-full">
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
                    onClick={() => setPostOpen(false)}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    onClick={handleCreatePost}
                    disabled={isPosting}
                  >
                    {isPosting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Publish
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {isLoadingPosts && (
        <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading posts...
        </div>
      )}

      {!isLoadingPosts && (
        <>
          {/* =========================
              NOTICES CONTAINER
          ========================= */}
          <div className="min-w-0 max-w-full overflow-hidden rounded-lg border p-4">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-medium">
              <Bell className="h-4 w-4" />
              Notices ({notices.length})
            </p>

            {notices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notices yet.</p>
            ) : (
              <div className="space-y-2">{notices.map(renderPostItem)}</div>
            )}
          </div>

          {/* =========================
              ASSIGNMENTS CONTAINER
          ========================= */}
          <div className="min-w-0 max-w-full overflow-hidden rounded-lg border p-4">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-medium">
              <ClipboardList className="h-4 w-4" />
              Assignments ({assignments.length})
            </p>

            {assignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No assignments yet.
              </p>
            ) : (
              <div className="space-y-2">{assignments.map(renderPostItem)}</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}