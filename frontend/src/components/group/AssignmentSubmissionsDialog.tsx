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
import { Textarea } from "@/components/ui/textarea";
import { CheckSquare, Download, Loader2, Square, MessageSquare, Save } from "lucide-react";
import {
  useGetSubmissionsQuery,
  useSetSubmissionStatusMutation,
  useSetSubmissionFeedbackMutation,
} from "../../api/GroupApi";
import { API_URL } from "@/lib/config";
import toast from "react-hot-toast";

interface AssignmentSubmissionsDialogProps {
  groupId: string;
  postId: number;
  postTitle: string;
}

interface SubmissionStudent {
  studentId: string;
  fullName: string;
  status: string;
  hasOnlineFile: boolean;
  originalFileName?: string;
  feedback?: string | null;
}

function FeedbackRow({
  groupId,
  postId,
  student,
}: {
  groupId: string;
  postId: number;
  student: SubmissionStudent;
}) {
  const [value, setValue] = useState(student.feedback ?? "");
  const [open, setOpen] = useState(false);
  const [setFeedback, { isLoading }] = useSetSubmissionFeedbackMutation();

  const save = async () => {
    try {
      await setFeedback({
        groupId,
        postId: String(postId),
        studentId: student.studentId,
        feedback: value,
      }).unwrap();
      toast.success("Feedback saved");
      setOpen(false);
    } catch {
      toast.error("Couldn't save feedback");
    }
  };

  return (
    <div className="mt-1.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        <MessageSquare className="h-3 w-3" />
        {student.feedback ? "Edit feedback" : "Add feedback"}
      </button>

      {open ? (
        <div className="mt-1.5 space-y-1.5">
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={2}
            placeholder="Write feedback for this student..."
            className="text-xs"
          />
          <Button size="sm" className="h-7 gap-1 text-xs" onClick={save} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            Save
          </Button>
        </div>
      ) : (
        student.feedback && (
          <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">{student.feedback}</p>
        )
      )}
    </div>
  );
}

export default function AssignmentSubmissionsDialog({
  groupId,
  postId,
  postTitle,
}: AssignmentSubmissionsDialogProps) {
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
        Manage submissions
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{postTitle} — Submissions</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading submissions...
          </div>
        )}

        {data && (
          <div className="space-y-3">
            <p className="text-sm font-medium">
              {data.submittedCount} / {data.totalStudents} Submitted
            </p>
            <p className="text-xs text-muted-foreground">
              Tick a student once you've confirmed their work — uploading a file alone does not
              mark it submitted.
            </p>

            <div className="max-h-96 space-y-2 overflow-y-auto">
              {data.students.map((s: SubmissionStudent) => {
                const isSubmitted = s.status === "Submitted";

                return (
                  <div key={s.studentId} className="rounded-md border p-2.5 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        className="flex items-center gap-2 text-left hover:opacity-80"
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

                      {s.hasOnlineFile && (
                        
                        <a  href={`${API_URL}/Groups/${groupId}/posts/${postId}/online-submissions/${s.studentId}/download`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          <Download className="h-3.5 w-3.5" />
                          {s.originalFileName || "File"}
                        </a>
                      )}
                    </div>

                    <FeedbackRow groupId={groupId} postId={postId} student={s} />
                  </div>
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