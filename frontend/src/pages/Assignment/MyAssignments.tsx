import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import SubmissionTracker from "@/components/group/SubmissionTracker";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarClock, ClipboardList, Loader2, Users2 } from "lucide-react";

import { useGetMyAssignmentsQuery } from "../../api/GroupApi";
import OnlineSubmissionsViewer from "@/components/group/OnlineSubmissionsViewer";

interface MyAssignment {
  id: number;
  groupId: number;
  groupName: string;
  title: string;
  originalFileName?: string | null;
  submissionMode?: string;
  dueDate?: string | null;
  postedAt: string;
  isPast: boolean;
  totalStudents: number;
  submittedCount: number;
}

function AssignmentRow({ item }: { item: MyAssignment }) {
  const navigate = useNavigate();

  const percent =
    item.totalStudents > 0
      ? Math.round((item.submittedCount / item.totalStudents) * 100)
      : 0;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="break-words text-sm font-medium leading-tight">
              {item.title}
            </p>

            <button
              type="button"
              onClick={() => navigate(`/groups/${item.groupId}`)}
              className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Users2 className="h-3 w-3" />
              {item.groupName}
            </button>

            {item.dueDate && (
              <p
                className={`mt-1 flex items-center gap-1 text-xs font-medium ${
                  item.isPast ? "text-destructive" : "text-amber-600"
                }`}
              >
                <CalendarClock className="h-3 w-3" />
                Due {new Date(item.dueDate).toLocaleString()}
              </p>
            )}
          </div>

          <SubmissionTracker
            groupId={String(item.groupId)}
            postId={item.id}
            postTitle={item.title}
          />
        </div>
        {item.submissionMode !== "Physical" && (
          <OnlineSubmissionsViewer
            groupId={String(item.groupId)}
            postId={item.id}
            postTitle={item.title}
          />
        )}

        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs">
            <span className="font-medium">
              {item.submittedCount} / {item.totalStudents} Submitted
            </span>
            <span className="text-muted-foreground">{percent}%</span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MyAssignments() {
  const { data, isLoading, isError } = useGetMyAssignmentsQuery(undefined);

  const current = useMemo(
    () => (data ?? []).filter((a: MyAssignment) => !a.isPast),
    [data],
  );

  const past = useMemo(
    () => (data ?? []).filter((a: MyAssignment) => a.isPast),
    [data],
  );

  return (
    <DashboardLayout activeMenu="Assignments">
      <div className="mx-auto max-w-3xl p-6">
        <div className="mb-6">
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <ClipboardList className="h-6 w-6 text-blue-500" />
            My Assignments
          </h1>
          <p className="text-sm text-muted-foreground">
            Assignments you posted, with physical submission progress.
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading assignments...
          </div>
        )}

        {isError && (
          <p className="text-sm text-destructive">
            Couldn't load your assignments.
          </p>
        )}

        {data && data.length === 0 && (
          <div className="rounded-lg border border-dashed py-16 text-center">
            <ClipboardList className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="font-medium">No assignments yet</p>
            <p className="text-sm text-muted-foreground">
              Post an assignment from any of your groups to see it here.
            </p>
          </div>
        )}

        {data && data.length > 0 && (
          <div className="space-y-8">
            <section>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                Current Assignments ({current.length})
              </h2>

              {current.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nothing currently open.
                </p>
              ) : (
                <div className="space-y-3">
                  {current.map((a: MyAssignment) => (
                    <AssignmentRow key={a.id} item={a} />
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                Past Assignments ({past.length})
              </h2>

              {past.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No past assignments.
                </p>
              ) : (
                <div className="space-y-3">
                  {past.map((a: MyAssignment) => (
                    <AssignmentRow key={a.id} item={a} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
