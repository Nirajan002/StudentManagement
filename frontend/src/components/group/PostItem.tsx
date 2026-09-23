import { Button } from "@/components/ui/button";
import {
  Bell,
  CalendarClock,
  CheckSquare,
  ClipboardList,
  Download,
  Image as ImageIcon,
  Loader2,
  Square,
  Trash2,
} from "lucide-react";

import { isImageFile } from "../utils/initials";
import { useGetMySubmissionQuery } from "../../api/GroupApi";
import OnlineSubmissionUpload from "./OnlineSubmissionUpload";
import { API_URL } from "@/lib/config";

import {
  resolveSubmissionMode,
  type GroupPost,
  type SubmissionModeOption,
} from "../utils/SubmitType";

// Read-only physical status shown to a student. Hidden for Online-only
// assignments, since a physical tick doesn't apply there.
function MySubmissionStatus({
  groupId,
  postId,
}: {
  groupId: string;
  postId: number;
}) {
  const { data, isLoading } = useGetMySubmissionQuery({
    groupId,
    postId: String(postId),
  });

  if (isLoading || !data) return null;

  const isSubmitted = data.status === "Submitted";

  return (
    <p
      className={`mt-1 flex items-center gap-1 text-xs font-medium ${
        isSubmitted ? "text-green-600" : "text-muted-foreground"
      }`}
    >
      {isSubmitted ? (
        <CheckSquare className="h-3 w-3" />
      ) : (
        <Square className="h-3 w-3" />
      )}
      Status: {isSubmitted ? "Submitted" : "Not Submitted"}
    </p>
  );
}

function ModeBadge({ mode }: { mode: SubmissionModeOption }) {
  const label =
    mode === "Both"
      ? "Physical + Online"
      : mode === "Online"
        ? "Online"
        : "Physical";

  return (
    <span className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
      {label}
    </span>
  );
}

function SubmissionFeedback({
  groupId,
  postId,
}: {
  groupId: string;
  postId: number;
}) {
  const { data } = useGetMySubmissionQuery({ groupId, postId: String(postId) });
  if (!data?.feedback) return null;

  return (
    <div className="mt-2 rounded-md border border-blue-200 bg-blue-50 p-2 dark:border-blue-900 dark:bg-blue-950/30">
      <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
        Teacher feedback
      </p>
      <p className="mt-0.5 whitespace-pre-wrap text-xs text-blue-900 dark:text-blue-200">
        {data.feedback}
      </p>
    </div>
  );
}

interface PostItemProps {
  post: GroupPost;
  groupId: string;
  isStudent: boolean;
  canDelete: boolean;
  isDeleting: boolean;
  onDelete: (postId: number) => void;
}

export default function PostItem({
  post,
  groupId,
  isStudent,
  canDelete,
  isDeleting,
  onDelete,
}: PostItemProps) {
  const isOverdue =
    post.type === "Assignment" &&
    post.dueDate &&
    new Date(post.dueDate) < new Date();

  const mode = resolveSubmissionMode(post);

  return (
    <div className="overflow-hidden rounded-md border bg-muted/30 p-3">
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

            {post.type === "Assignment" && <ModeBadge mode={mode} />}

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

            {post.type === "Assignment" && isStudent && mode !== "Online" && (
              <MySubmissionStatus groupId={groupId} postId={post.id} />
            )}

            {post.type === "Assignment" && isStudent && mode !== "Physical" && (
              <OnlineSubmissionUpload
                groupId={groupId}
                postId={post.id}
                disabled={!!isOverdue}
              />
            )}

            {post.type === "Assignment" && isStudent && (
              <SubmissionFeedback groupId={groupId} postId={post.id} />
            )}

            {post.fileName && (
              <a
                href={`${API_URL}/Groups/${groupId}/posts/${post.id}/download`}
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
                Auto-deletes on{" "}
                {new Date(post.autoDeleteAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {canDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(post.id)}
            disabled={isDeleting}
            aria-label="Delete post"
            className="shrink-0"
          >
            {isDeleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
