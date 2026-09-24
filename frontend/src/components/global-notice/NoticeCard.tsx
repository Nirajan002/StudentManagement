import { useState } from "react";
import {
  Megaphone,
  Clock,
  Calendar,
  Download,
  Copy,
  Check,
  Loader2,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { getFileIcon } from "@/components/utils/fileIcon";
import { API_URL } from "@/lib/config";
import type { GlobalNotice } from "./types";

interface NoticeCardProps {
  notice: GlobalNotice;
  isAdmin: boolean;
  isDeleting: boolean;
  onDelete: (id: number) => void;
}

export default function NoticeCard({
  notice,
  isAdmin,
  isDeleting,
  onDelete,
}: NoticeCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `${notice.title}\n\n${
      notice.content || ""
    }\n\nPosted by: ${notice.postedByName}`;

    navigator.clipboard.writeText(text);
    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-xs transition-all hover:border-emerald-500/30 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3.5">
          <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20">
            <Megaphone className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="break-words text-base font-semibold tracking-tight text-foreground">
              {notice.title}
            </h2>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {notice.postedByName}
              </span>

              <span>•</span>

              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />

                {new Date(notice.postedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>

              {notice.autoDeleteAt && (
                <>
                  <span>•</span>

                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <Calendar className="h-3 w-3" />

                    Expires{" "}
                    {new Date(notice.autoDeleteAt).toLocaleDateString()}
                  </span>
                </>
              )}
            </div>

            {notice.content && (
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">
                {notice.content}
              </p>
            )}

            {notice.fileName && (
              <div className="mt-4 inline-block">
                <a
                  href={`${API_URL}/GlobalNotices/${notice.id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 rounded-lg border bg-muted/40 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {getFileIcon(notice.originalFileName)}

                  <span className="max-w-xs truncate">
                    {notice.originalFileName || "Download attachment"}
                  </span>

                  <Download className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {/* Copy notice button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            onClick={handleCopy}
            title="Copy Notice Text"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}

            <span className="sr-only">Copy Notice Text</span>
          </Button>

          {/* Delete notice button */}
          {isAdmin && (
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isDeleting}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    title="Delete Announcement"
                  />
                }
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}

                <span className="sr-only">Delete Announcement</span>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Delete this announcement?
                  </AlertDialogTitle>

                  <AlertDialogDescription>
                    Are you sure you want to delete &ldquo;{notice.title}
                    &rdquo;? This will permanently remove it for all teachers
                    and students.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>

                  <AlertDialogAction
                    onClick={() => onDelete(notice.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Notice
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
}