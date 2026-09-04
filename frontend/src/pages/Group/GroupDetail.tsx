import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

import {
  ArrowLeft,
  Loader2,
  UserPlus,
  UserMinus,
} from "lucide-react";

import DashboardLayout from "@/components/layouts/DashboardLayout";

import {
  StudentPicker,
  type PickedStudent,
} from "./StudentPicker";

import {
  useGetGroupByIdQuery,
  useAddGroupMembersMutation,
  useRemoveGroupMemberMutation,
} from "../../api/GroupApi";

function initials(name: string) {
  return (name || "")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();

  // Group Id is a Guid, so don't convert it to Number
  const groupId = id as string;

  const navigate = useNavigate();

  const {
    data: group,
    isLoading,
    isError,
  } = useGetGroupByIdQuery(groupId, {
    skip: !groupId,
  });

  const [addMembers, { isLoading: isAdding }] =
    useAddGroupMembersMutation();

  const [removeMember] =
    useRemoveGroupMemberMutation();

  const [addOpen, setAddOpen] = useState(false);

  const [studentsToAdd, setStudentsToAdd] =
    useState<PickedStudent[]>([]);

  const [removingId, setRemovingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const handleAddMembers = async () => {
    if (studentsToAdd.length === 0) {
      return;
    }

    try {
      setError(null);

      await addMembers({
        groupId,
        studentIds: studentsToAdd.map(
          (student) => student.id
        ),
      }).unwrap();

      setAddOpen(false);
      setStudentsToAdd([]);
    } catch {
      setError(
        "Couldn't add students. Try again."
      );
    }
  };

  const handleRemove = async (studentId: string) => {
    setRemovingId(studentId);

    try {
      setError(null);

      await removeMember({
        groupId,
        studentId,
      }).unwrap();
    } catch {
      setError(
        "Couldn't remove student. Try again."
      );
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl p-6">

        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2 text-muted-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to groups
        </Button>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading group...
          </div>
        )}

        {/* Error */}
        {isError && (
          <p className="text-sm text-destructive">
            Couldn't load this group.
          </p>
        )}

        {/* Group */}
        {group && (
          <>
            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  {group.name}
                </h1>

                {group.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {group.description}
                  </p>
                )}
              </div>

              {/* Add students dialog */}
              <Dialog
                open={addOpen}
                onOpenChange={(next) => {
                  setAddOpen(next);

                  if (!next) {
                    setStudentsToAdd([]);
                  }
                }}
              >
                {/* IMPORTANT:
                    Base UI DialogTrigger already renders a button.
                    Do NOT use asChild with another Button.
                */}
                <DialogTrigger
                  type="button"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  <UserPlus className="h-4 w-4" />
                  Add students
                </DialogTrigger>

                <DialogContent className="sm:max-w-md">

                  <DialogHeader>
                    <DialogTitle>
                      Add students to {group.name}
                    </DialogTitle>
                  </DialogHeader>

                  <StudentPicker
                    selected={studentsToAdd}
                    onChange={setStudentsToAdd}
                    excludeIds={group.members.map(
                      (member: any) => member.studentId
                    )}
                  />

                  <DialogFooter>

                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setAddOpen(false)}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="button"
                      onClick={handleAddMembers}
                      disabled={
                        isAdding ||
                        studentsToAdd.length === 0
                      }
                    >
                      {isAdding && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}

                      Add{" "}
                      {studentsToAdd.length > 0
                        ? studentsToAdd.length
                        : ""}
                    </Button>

                  </DialogFooter>

                </DialogContent>
              </Dialog>
            </div>

            {/* Error message */}
            {error && (
              <p className="mb-4 text-sm text-destructive">
                {error}
              </p>
            )}

            {/* Member count */}
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              {group.members.length} member
              {group.members.length === 1
                ? ""
                : "s"}
            </p>

            {/* Members */}
            <div className="space-y-2">

              {group.members.map(
                (member: any) => (
                  <Card key={member.studentId}>
                    <CardContent className="flex items-center justify-between p-3">

                      <div className="flex items-center gap-3">

                        <Avatar className="h-9 w-9">
                          <AvatarFallback>
                            {initials(member.fullName)}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <p className="text-sm font-medium leading-none">
                            {member.fullName}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {member.email}
                          </p>
                        </div>

                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleRemove(
                            member.studentId
                          )
                        }
                        disabled={
                          removingId ===
                          member.studentId
                        }
                        aria-label={`Remove ${member.fullName}`}
                      >
                        {removingId ===
                        member.studentId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserMinus className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>

                    </CardContent>
                  </Card>
                )
              )}

              {/* Empty state */}
              {group.members.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No students in this group yet.
                </p>
              )}

            </div>
          </>
        )}

      </div>
    </DashboardLayout>
  );
}