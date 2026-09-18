import { useCallback, useMemo, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Loader2,
} from "lucide-react";

import CreatePostDialog from "./CreatePostDialog";
import PostItem from "./PostItem";
import type { GroupPost } from "../utils/SubmitType";

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

export default function PostsSectionProps({
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
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [showSubmitted, setShowSubmitted] = useState(false);

  const isStudent = currentUserRole === "Student";

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
    [sortOrder],
  );

  const notices = useMemo(
    () => sortPosts((posts ?? []).filter((p) => p.type === "Notice")),
    [posts, sortPosts],
  );

  const assignments = useMemo(
    () => sortPosts((posts ?? []).filter((p) => p.type === "Assignment")),
    [posts, sortPosts],
  );

  // Students see only what's still outstanding in the main list; anything
  // they've already handed in moves to a collapsed section below, so it
  // doesn't read as "still to do" but stays reachable for replacing a file.
  const openAssignments = useMemo(
    () => (isStudent ? assignments.filter((a) => !a.hasSubmitted) : assignments),
    [assignments, isStudent],
  );

  const submittedAssignments = useMemo(
    () => (isStudent ? assignments.filter((a) => a.hasSubmitted) : []),
    [assignments, isStudent],
  );

  const renderPost = (post: GroupPost) => (
    <PostItem
      key={post.id}
      post={post}
      groupId={groupId}
      isStudent={isStudent}
      canDelete={
        !!currentUserId &&
        (currentUserRole === "Admin" || currentUserId === post.postedById)
      }
      isDeleting={deletingPostId === post.id}
      onDelete={onDeletePost}
    />
  );

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
            <CreatePostDialog
              groupName={groupName}
              isPosting={isPosting}
              onCreatePost={onCreatePost}
            />
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
          <div className="min-w-0 max-w-full overflow-hidden rounded-lg border p-4">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-medium">
              <Bell className="h-4 w-4" />
              Notices ({notices.length})
            </p>

            {notices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notices yet.</p>
            ) : (
              <div className="space-y-2">{notices.map(renderPost)}</div>
            )}
          </div>

          <div className="min-w-0 max-w-full overflow-hidden rounded-lg border p-4">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-medium">
              <ClipboardList className="h-4 w-4" />
              Assignments ({openAssignments.length})
            </p>

            {openAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {isStudent && assignments.length > 0
                  ? "You're all caught up — nothing left to submit."
                  : "No assignments yet."}
              </p>
            ) : (
              <div className="space-y-2">{openAssignments.map(renderPost)}</div>
            )}

            {submittedAssignments.length > 0 && (
              <div className="mt-4 border-t pt-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitted((v) => !v)}
                  aria-expanded={showSubmitted}
                  className="flex items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {showSubmitted ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <CheckSquare className="h-4 w-4 text-green-600" />
                  Submitted ({submittedAssignments.length})
                </button>

                {showSubmitted && (
                  <div className="mt-2 space-y-2 opacity-75">
                    {submittedAssignments.map(renderPost)}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}