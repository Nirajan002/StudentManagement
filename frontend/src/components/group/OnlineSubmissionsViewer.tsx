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
import { Download, FileText, Loader2 } from "lucide-react";
import { useGetOnlineSubmissionsQuery } from "../../api/GroupApi";

interface OnlineSubmissionsViewerProps {
  groupId: string;
  postId: number;
  postTitle: string;
}

export default function OnlineSubmissionsViewer({
  groupId,
  postId,
  postTitle,
}: OnlineSubmissionsViewerProps) {
  const [open, setOpen] = useState(false);

  const { data, isLoading, isError } = useGetOnlineSubmissionsQuery(
    { groupId, postId: String(postId) },
    { skip: !open }
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        type="button"
        className="inline-flex h-7 items-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-xs font-medium hover:bg-muted"
      >
        <FileText className="h-3.5 w-3.5" />
        View online submissions
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{postTitle} — Online Submissions</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading submissions...
          </div>
        )}

        {isError && (
          <p className="text-sm text-destructive">
            Couldn't load submissions for this assignment.
          </p>
        )}

        {data && (
          <div className="space-y-3">
            <p className="text-sm font-medium">
              {data.submittedCount} / {data.totalStudents} Submitted Online
            </p>

            <div className="max-h-80 space-y-1 overflow-y-auto">
              {data.students.map((s: any) => (
                <div
                  key={s.studentId}
                  className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm"
                >
                  <span>{s.fullName}</span>

                  {s.hasSubmitted ? (
                    
                    <a  href={`https://localhost:7014/api/Groups/${groupId}/posts/${postId}/online-submissions/${s.studentId}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      <Download className="h-3.5 w-3.5" />
                      {s.originalFileName || "Download"}
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">Not submitted</span>
                  )}
                </div>
              ))}
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