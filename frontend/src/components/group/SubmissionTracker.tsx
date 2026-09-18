import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckSquare, Loader2, Square } from "lucide-react";
import {
  useGetSubmissionsQuery,
  useSetSubmissionStatusMutation,
} from "../../api/GroupApi";

interface SubmissionTrackerProps {
  groupId: string;
  postId: number;
  postTitle: string;
}

interface SubmissionStudent {
  studentId: string;
  fullName: string;
  status: string;
}

export default function SubmissionTracker({
  groupId,
  postId,
  postTitle,
}: SubmissionTrackerProps) {
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useGetSubmissionsQuery(
    { groupId, postId: String(postId) },
    { skip: !open }
  );

  const [setStatus, { isLoading: isToggling }] = useSetSubmissionStatusMutation();

  const toggle = (studentId: string, currentlySubmitted: boolean) => {
    setStatus({ groupId, postId: String(postId), studentId, submitted: !currentlySubmitted });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        type="button"
        className="inline-flex h-7 items-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-xs font-medium hover:bg-muted"
      >
        <CheckSquare className="h-3.5 w-3.5" />
        Track physical submissions
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{postTitle} — Physical Submissions</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading students...
          </div>
        )}

        {data && (
          <div className="space-y-3">
            <p className="text-sm font-medium">
              {data.submittedCount} / {data.totalStudents} Submitted
              {data.totalStudents > 0 && (
                <span className="ml-1 text-muted-foreground">
                  ({Math.round((data.submittedCount / data.totalStudents) * 100)}%)
                </span>
              )}
            </p>

            <div className="max-h-80 space-y-1 overflow-y-auto">
              {data.students.map((s: SubmissionStudent) => {
                const isSubmitted = s.status === "Submitted";

                return (
                  <button
                    key={s.studentId}
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md border p-2 text-left text-sm hover:bg-muted/50"
                    onClick={() => toggle(s.studentId, isSubmitted)}
                    disabled={isToggling}
                  >
                    {isSubmitted ? (
                      <CheckSquare className="h-4 w-4 shrink-0 text-green-600" />
                    ) : (
                      <Square className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span>{s.fullName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}