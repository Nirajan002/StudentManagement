import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, UserMinus, UserPlus, Users2, ExternalLink } from "lucide-react";

import { TeacherPicker, type PickedTeacher } from "./TeacherPicker";
import { initials } from "../utils/initials";
import { getUploadUrl } from "@/lib/config";

interface GroupManager {
  teacherId: string;
  fullName: string;
  email: string;
  profile?: string | null;
}

interface Group {
  name: string;
  createdById: string | number;
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
    <div className="rounded-xl border border-border/80 bg-card p-4 shadow-xs">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-semibold text-foreground">Co-teachers</h3>
          <Badge variant="secondary" className="h-5 px-1.5 text-xs font-medium">
            {group.managers?.length ?? 0}
          </Badge>
        </div>

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
              className="inline-flex h-7 items-center justify-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-xs font-medium shadow-xs transition-colors hover:bg-muted"
            >
              <UserPlus className="h-3 w-3" />
              Add
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                  <UserPlus className="h-4 w-4 text-primary" />
                  Add co-teachers to {group.name}
                </DialogTitle>
              </DialogHeader>

              <TeacherPicker
                selected={teachersToAdd}
                onChange={setTeachersToAdd}
                excludeIds={[
                  String(group.createdById),
                  ...(group.managers ?? []).map((m) => m.teacherId),
                ]}
              />

              <DialogFooter className="gap-2 sm:gap-0">
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
                  Add {teachersToAdd.length > 0 ? `${teachersToAdd.length} Teacher${teachersToAdd.length > 1 ? "s" : ""}` : ""}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {group.managers && group.managers.length > 0 ? (
        <div className="space-y-2">
          {group.managers.map((manager) => {
            const profileUrl = getUploadUrl(manager.profile);

            return (
              <div
                key={manager.teacherId}
                className="group flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2.5 transition-all hover:border-border hover:bg-muted/40"
              >
                <div
                  className="flex flex-1 cursor-pointer items-center gap-3 min-w-0"
                  onClick={() => navigate(`/Teacher/${manager.teacherId}`)}
                >
                  <Avatar className="h-8 w-8 shrink-0 border border-border/70">
                    {profileUrl && (
                      <AvatarImage src={profileUrl} alt={manager.fullName} />
                    )}
                    <AvatarFallback className="bg-blue-600/10 text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {initials(manager.fullName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-medium leading-tight text-foreground group-hover:text-primary">
                        {manager.fullName}
                      </p>
                      <ExternalLink className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {manager.email}
                    </p>
                  </div>
                </div>

                {canManageCoTeachers && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground opacity-60 hover:text-destructive hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveManager(manager.teacherId);
                    }}
                    disabled={removingManagerId === manager.teacherId}
                    aria-label={`Remove ${manager.fullName}`}
                  >
                    {removingManagerId === manager.teacherId ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-destructive" />
                    ) : (
                      <UserMinus className="h-3.5 w-3.5" />
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-6 text-center">
          <Users2 className="mx-auto mb-1.5 h-6 w-6 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground">No co-teachers assigned yet.</p>
        </div>
      )}
    </div>
  );
}