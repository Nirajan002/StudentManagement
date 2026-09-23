import { useNavigate } from "react-router-dom";
import {
  CalendarClock,
  Users2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileUp,
  FileText,
  Paperclip,
  ArrowUpRight,
} from "lucide-react";

import AssignmentSubmissionsDialog from "@/components/group/AssignmentSubmissionsDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import type { MyAssignment } from "./types";

function DeadlineBadge({ item }: { item: MyAssignment }) {
  if (!item.dueDate) return null;

  if (item.isPast) {
    return (
      <Badge
        variant="outline"
        className="border-destructive/30 bg-destructive/10 text-destructive text-xs gap-1"
      >
        <AlertTriangle className="h-3 w-3" />
        Closed / Past Due
      </Badge>
    );
  }

  const diffDays = Math.ceil(
    (new Date(item.dueDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24),
  );

  if (diffDays <= 1) {
    return (
      <Badge
        variant="outline"
        className="border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 text-xs gap-1"
      >
        <Clock className="h-3 w-3" />
        Due Today / Tomorrow
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-border text-muted-foreground text-xs gap-1"
    >
      <CalendarClock className="h-3 w-3" />
      Due{" "}
      {new Date(item.dueDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })}
    </Badge>
  );
}

export default function AssignmentCard({ item }: { item: MyAssignment }) {
  const navigate = useNavigate();

  const percent =
    item.totalStudents > 0
      ? Math.round((item.submittedCount / item.totalStudents) * 100)
      : 0;

  const isCompleted =
    item.totalStudents > 0 && item.submittedCount >= item.totalStudents;
  const isOnline = item.submissionMode !== "Physical";

  return (
    <Card className="overflow-hidden transition-all hover:border-emerald-500/30 hover:shadow-xs">
      <CardContent className="p-5">
        {/* Top Meta Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/groups/${item.groupId}`)}
              className="group inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Users2 className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-600" />
              <span>{item.groupName}</span>
              <ArrowUpRight className="h-3 w-3 text-muted-foreground opacity-60 group-hover:opacity-100" />
            </button>

            <Badge
              variant="outline"
              className={
                isOnline
                  ? "border-sky-200 bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 text-[11px] gap-1"
                  : "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 text-[11px] gap-1"
              }
            >
              {isOnline ? (
                <FileUp className="h-3 w-3" />
              ) : (
                <FileText className="h-3 w-3" />
              )}
              {item.submissionMode || "Online & Physical"}
            </Badge>

            {item.originalFileName && (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground truncate max-w-[160px]">
                <Paperclip className="h-3 w-3" />
                {item.originalFileName}
              </span>
            )}
          </div>

          <DeadlineBadge item={item} />
        </div>

        {/* Title & Action Buttons Row */}
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold tracking-tight text-foreground break-words">
              {item.title}
            </h3>
            {item.dueDate && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Final deadline: {new Date(item.dueDate).toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <AssignmentSubmissionsDialog
                groupId={String(item.groupId)}
                postId={item.id}
                postTitle={item.title}
              />
            </div>
          </div>
        </div>

        {/* Submission Progress Bar Section */}
        <div className="mt-4 rounded-xl bg-muted/30 p-3">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground">
                {item.submittedCount} of {item.totalStudents} Submitted
              </span>
              {isCompleted ? (
                <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> All Turned In
                </span>
              ) : (
                <span className="text-muted-foreground">
                  ({item.totalStudents - item.submittedCount} remaining)
                </span>
              )}
            </div>
            <span
              className={`font-semibold ${isCompleted ? "text-emerald-600" : "text-foreground"}`}
            >
              {percent}%
            </span>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted ? "bg-emerald-500" : "bg-emerald-600"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
