import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, UserMinus, UserPlus, Users2 } from "lucide-react";

import { TeacherPicker, type PickedTeacher } from "./TeacherPicker";
import { initials } from "../utils/initials";

interface GroupManager {
  teacherId: string;
  fullName: string;
  email: string;
  profile?: string | null;
}

interface Group {
  name: string;
  createdById: string;
  managers?: GroupManager[];
}

interface CoTeachersSectionProps {
  group: Group;
  canManageCoTeachers: boolean;
  isAddingManager: boolean;
  removingManagerId: string | null;
  onAddManagers: (teacherIds: string[]) => Promise<boolean>;
  onRemoveManager: (teacherId: string) => void;
}

export default function CoTeachersSection({
  group,
  canManageCoTeachers,
  isAddingManager,
  removingManagerId,
  onAddManagers,
  onRemoveManager,
}: CoTeachersSectionProps) {
  const navigate = useNavigate();

  const [addManagerOpen, setAddManagerOpen] = useState(false);
  const [teachersToAdd, setTeachersToAdd] = useState<PickedTeacher[]>([]);

  const handleAddManagers = async () => {
    if (teachersToAdd.length === 0) return;

    const success = await onAddManagers(
      teachersToAdd.map((teacher) => teacher.id)
    );

    if (success) {
      setAddManagerOpen(false);
      setTeachersToAdd([]);
    }
  };

  return (
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

              if (!next) {
                setTeachersToAdd([]);
              }
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
                <DialogTitle>Add co-teachers to {group.name}</DialogTitle>
              </DialogHeader>

              <TeacherPicker
                selected={teachersToAdd}
                onChange={setTeachersToAdd}
                excludeIds={[
                  group.createdById,
                  ...(group.managers ?? []).map((m) => m.teacherId),
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
                  disabled={isAddingManager || teachersToAdd.length === 0}
                >
                  {isAddingManager && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add {teachersToAdd.length > 0 ? teachersToAdd.length : ""}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {group.managers && group.managers.length > 0 ? (
        <div className="space-y-2">
          {group.managers.map((manager) => (
            <div
              key={manager.teacherId}
              className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2"
            >
              <div
                className="flex flex-1 cursor-pointer items-center gap-2"
                onClick={() => navigate(`/Teacher/${manager.teacherId}`)}
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
                    onRemoveManager(manager.teacherId);
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
        <p className="text-sm text-muted-foreground">No co-teachers yet.</p>
      )}
    </div>
  );
}