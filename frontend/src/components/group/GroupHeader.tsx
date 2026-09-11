/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Loader2, UserPlus } from "lucide-react";

import { StudentPicker, type PickedStudent } from "./StudentPicker";

interface GroupHeaderProps {
  group: any;
  canManageStudents: boolean;
  isAdding: boolean;
  onAddMembers: (studentIds: string[]) => Promise<boolean>;
}

export default function GroupHeader({
  group,
  canManageStudents,
  isAdding,
  onAddMembers,
}: GroupHeaderProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [studentsToAdd, setStudentsToAdd] = useState<PickedStudent[]>([]);

  const handleAddMembers = async () => {
    if (studentsToAdd.length === 0) return;

    const success = await onAddMembers(
      studentsToAdd.map((student) => student.id)
    );

    if (success) {
      setAddOpen(false);
      setStudentsToAdd([]);
    }
  };

  return (
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
      </div>

      {canManageStudents && (
        <Dialog
          open={addOpen}
          onOpenChange={(next) => {
            setAddOpen(next);

            if (!next) {
              setStudentsToAdd([]);
            }
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
              <DialogTitle>Add students to {group.name}</DialogTitle>
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
      )}
    </div>
  );
}