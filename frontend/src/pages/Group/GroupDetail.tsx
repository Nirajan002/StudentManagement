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
  ArrowLeft,
  Loader2,
  UserPlus,
  UserMinus,
  ShieldCheck,
  Users2,
} from "lucide-react";

import DashboardLayout from "@/components/layouts/DashboardLayout";

import {
  StudentPicker,
  type PickedStudent,
} from "./StudentPicker";

import {
  TeacherPicker,
  type PickedTeacher,
} from "./TeacherPicker";

import {
  useGetGroupByIdQuery,
  useAddGroupMembersMutation,
  useRemoveGroupMemberMutation,
  useAddGroupManagersMutation,
  useRemoveGroupManagerMutation,
} from "../../api/GroupApi";

import { useGetCurrentUserQuery } from "../../api/AuthApi";

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
  const groupId = id as string;

  const navigate = useNavigate();

  const {
    data: group,
    isLoading,
    isError,
  } = useGetGroupByIdQuery(groupId, {
    skip: !groupId,
  });

  const { data: currentUser } = useGetCurrentUserQuery();

  const [addMembers, { isLoading: isAdding }] =
    useAddGroupMembersMutation();

  const [removeMember] = useRemoveGroupMemberMutation();

  const [addManagers, { isLoading: isAddingManager }] =
    useAddGroupManagersMutation();

  const [removeManager] = useRemoveGroupManagerMutation();

  const [addOpen, setAddOpen] = useState(false);
  const [studentsToAdd, setStudentsToAdd] = useState<PickedStudent[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const [addManagerOpen, setAddManagerOpen] = useState(false);
  const [teachersToAdd, setTeachersToAdd] = useState<PickedTeacher[]>([]);
  const [removingManagerId, setRemovingManagerId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  // Only the creator or an Admin can manage co-teachers
  const canManageCoTeachers =
    currentUser &&
    group &&
    (currentUser.role === "Admin" || currentUser.id === group.createdById);

  const handleAddMembers = async () => {
    if (studentsToAdd.length === 0) return;

    try {
      setError(null);

      await addMembers({
        groupId,
        studentIds: studentsToAdd.map((student) => student.id),
      }).unwrap();

      setAddOpen(false);
      setStudentsToAdd([]);
    } catch {
      setError("Couldn't add students. Try again.");
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
      setError("Couldn't remove student. Try again.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddManagers = async () => {
    if (teachersToAdd.length === 0) return;

    try {
      setError(null);

      await addManagers({
        groupId,
        teacherIds: teachersToAdd.map((teacher) => teacher.id),
      }).unwrap();

      setAddManagerOpen(false);
      setTeachersToAdd([]);
    } catch {
      setError("Couldn't add co-teachers. Try again.");
    }
  };

  const handleRemoveManager = async (teacherId: string) => {
    setRemovingManagerId(teacherId);

    try {
      setError(null);

      await removeManager({
        groupId,
        teacherId,
      }).unwrap();
    } catch {
      setError("Couldn't remove co-teacher. Try again.");
    } finally {
      setRemovingManagerId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl p-6">

        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2 text-muted-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to groups
        </Button>

        {isLoading && (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading group...
          </div>
        )}

        {isError && (
          <p className="text-sm text-destructive">
            Couldn't load this group.
          </p>
        )}

        {group && (
          <>
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  {group.name}
                </h1>

                {group.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {group.description}
                  </p>
                )}

                {group.createdByName && (
                  <p
                    className="mt-2 flex w-fit cursor-pointer items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => navigate(`/Teacher/${group.createdById}`)}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    {group.createdByRole || "Admin"}:{" "}
                    <span className="font-medium text-foreground">
                      {group.createdByName}
                    </span>
                  </p>
                )}
              </div>

              {/* Add students dialog */}
              <Dialog
                open={addOpen}
                onOpenChange={(next) => {
                  setAddOpen(next);
                  if (!next) setStudentsToAdd([]);
                }}
              >
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
                      disabled={isAdding || studentsToAdd.length === 0}
                    >
                      {isAdding && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Add {studentsToAdd.length > 0 ? studentsToAdd.length : ""}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {error && (
              <p className="mb-4 text-sm text-destructive">{error}</p>
            )}

            {/* =========================
                CO-TEACHERS SECTION
            ========================= */}

            <div className="mb-6 rounded-lg border p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  <Users2 className="h-4 w-4" />
                  Co-teachers ({group.managers?.length ?? 0})
                </p>

                {canManageCoTeachers && (
                  <Dialog
                    open={addManagerOpen}
                    onOpenChange={(next) => {
                      setAddManagerOpen(next);
                      if (!next) setTeachersToAdd([]);
                    }}
                  >
                    <DialogTrigger
                      type="button"
                      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-input bg-background px-3 text-xs font-medium shadow-xs transition-colors hover:bg-muted"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Add co-teacher
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          Add co-teachers to {group.name}
                        </DialogTitle>
                      </DialogHeader>

                      <TeacherPicker
                        selected={teachersToAdd}
                        onChange={setTeachersToAdd}
                        excludeIds={[
                          group.createdById,
                          ...(group.managers ?? []).map(
                            (m: any) => m.teacherId
                          ),
                        ]}
                      />

                      <DialogFooter>
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => setAddManagerOpen(false)}
                        >
                          Cancel
                        </Button>

                        <Button
                          type="button"
                          onClick={handleAddManagers}
                          disabled={
                            isAddingManager || teachersToAdd.length === 0
                          }
                        >
                          {isAddingManager && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Add{" "}
                          {teachersToAdd.length > 0
                            ? teachersToAdd.length
                            : ""}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {group.managers && group.managers.length > 0 ? (
                <div className="space-y-2">
                  {group.managers.map((manager: any) => (
                    <div
                      key={manager.teacherId}
                      className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2"
                    >
                      <div
                        className="flex flex-1 cursor-pointer items-center gap-2"
                        onClick={() =>
                          navigate(`/Teacher/${manager.teacherId}`)
                        }
                      >
                        {manager.profile ? (
                          <img
                            src={`https://localhost:7014/uploads/${manager.profile}`}
                            alt={manager.fullName}
                            className="h-7 w-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
                            {initials(manager.fullName)}
                          </div>
                        )}

                        <div>
                          <p className="text-sm font-medium leading-none">
                            {manager.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {manager.email}
                          </p>
                        </div>
                      </div>

                      {canManageCoTeachers && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveManager(manager.teacherId);
                          }}
                          disabled={removingManagerId === manager.teacherId}
                          aria-label={`Remove ${manager.fullName}`}
                        >
                          {removingManagerId === manager.teacherId ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <UserMinus className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No co-teachers yet.
                </p>
              )}
            </div>

            {/* =========================
                MEMBERS SECTION
            ========================= */}

            <p className="mb-3 text-sm font-medium text-muted-foreground">
              {group.members.length} member
              {group.members.length === 1 ? "" : "s"}
            </p>

            <div className="space-y-2">
              {group.members.map((member: any) => (
                <Card key={member.studentId}>
                  <CardContent className="flex items-center justify-between p-3">
                    <div
                      className="flex flex-1 items-center gap-3 -m-1 cursor-pointer rounded-md p-1 transition-colors hover:bg-muted/50"
                      onClick={() =>
                        navigate(`/Student/${member.studentId}`)
                      }
                    >
                      {member.profile ? (
                        <img
                          src={`https://localhost:7014/uploads/${member.profile}`}
                          alt={member.fullName}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                          {initials(member.fullName)}
                        </div>
                      )}

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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(member.studentId);
                      }}
                      disabled={removingId === member.studentId}
                      aria-label={`Remove ${member.fullName}`}
                    >
                      {removingId === member.studentId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserMinus className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}

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