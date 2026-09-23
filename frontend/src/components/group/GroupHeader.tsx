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
import {
  Loader2,
  UserPlus,
  Users,
  GraduationCap,
  Calendar,
  Share2,
  Check,
  Pencil,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StudentPicker, type PickedStudent } from "./StudentPicker";
import { getUploadUrl } from "@/lib/config";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

// Preset banner gradients matching GroupList for design continuity
const CARD_THEMES = [
  { banner: "from-emerald-600 via-teal-600 to-cyan-700" },
  { banner: "from-blue-600 via-indigo-600 to-violet-700" },
  { banner: "from-purple-600 via-fuchsia-600 to-pink-700" },
  { banner: "from-amber-500 via-orange-600 to-rose-700" },
  { banner: "from-teal-600 via-emerald-600 to-green-700" },
];

interface GroupMember {
  studentId: string;
}

interface GroupManager {
  teacherId: string;
}

interface Group {
  id?: number;
  name: string;
  description?: string | null;
  backgroundImage?: string | null;
  createdById?: number | string;
  createdByName?: string | null;
  createdByRole?: string | null;
  createdAt?: string | null;
  members: GroupMember[];
  managers?: GroupManager[];
}

interface GroupHeaderProps {
  group: Group;
  canManageStudents: boolean;
  canManageCoTeachers?: boolean;
  isAdding: boolean;
  onAddMembers: (studentIds: string[]) => Promise<boolean>;
  onEditGroup?: () => void;
}

export default function GroupHeader({
  group,
  canManageStudents,
  canManageCoTeachers,
  isAdding,
  onAddMembers,
  onEditGroup,
}: GroupHeaderProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [studentsToAdd, setStudentsToAdd] = useState<PickedStudent[]>([]);
  const [copied, setCopied] = useState(false);

  const theme = CARD_THEMES[(group.id ?? 0) % CARD_THEMES.length];
  const bgUrl = getUploadUrl(group.backgroundImage);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Group link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddMembers = async () => {
    if (studentsToAdd.length === 0) return;

    const success = await onAddMembers(
      studentsToAdd.map((student) => student.id)
    );

    if (success) {
      setAddOpen(false);
      setStudentsToAdd([]);
      toast.success("Students added successfully!");
    }
  };

  const formattedDate = group.createdAt
    ? new Date(group.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-border/80 shadow-md">
      {/* Background Cover Image or Gradient */}
      {bgUrl ? (
        <div className="absolute inset-0">
          <img
            src={bgUrl}
            alt={group.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/35 backdrop-blur-[0.5px]" />
        </div>
      ) : (
        <div className={cn("absolute inset-0 bg-gradient-to-r", theme.banner)}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-black/35" />
          {/* Subtle geometric dot pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>
      )}

      {/* Hero Banner Content */}
      <div className="relative z-10 flex flex-col justify-between p-6 sm:p-8 md:min-h-[220px]">
        {/* Top Badges & Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-white/20 bg-white/15 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
              Group #{group.id}
            </Badge>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/25 px-2.5 py-1 text-xs font-medium text-white/95 backdrop-blur-md">
              <Users className="h-3.5 w-3.5 text-white/80" />
              {group.members.length} {group.members.length === 1 ? "Student" : "Students"}
            </span>

            {group.managers && group.managers.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/25 px-2.5 py-1 text-xs font-medium text-white/95 backdrop-blur-md">
                <GraduationCap className="h-3.5 w-3.5 text-white/80" />
                {group.managers.length + 1} Faculty
              </span>
            )}
          </div>

          {/* Action Buttons in Hero */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="h-8 border-white/25 bg-black/30 text-xs font-medium text-white backdrop-blur-md transition-all hover:bg-white/20 hover:text-white"
            >
              {copied ? (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Share2 className="mr-1.5 h-3.5 w-3.5" />
                  Share Link
                </>
              )}
            </Button>

            {canManageCoTeachers && onEditGroup && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onEditGroup}
                className="h-8 border-white/25 bg-black/30 text-xs font-medium text-white backdrop-blur-md transition-all hover:bg-white/20 hover:text-white"
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit Group
              </Button>
            )}

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
                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-slate-900 shadow-sm transition-all hover:bg-white/90 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <UserPlus className="h-3.5 w-3.5 text-slate-900" />
                  Add Students
                </DialogTrigger>

                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                      <UserPlus className="h-4 w-4 text-primary" />
                      Add students to {group.name}
                    </DialogTitle>
                  </DialogHeader>

                  <StudentPicker
                    selected={studentsToAdd}
                    onChange={setStudentsToAdd}
                    excludeIds={group.members.map((member) => member.studentId)}
                  />

                  <DialogFooter className="gap-2 sm:gap-0">
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
                      Add {studentsToAdd.length > 0 ? `${studentsToAdd.length} Student${studentsToAdd.length > 1 ? "s" : ""}` : ""}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Title, Description & Metadata */}
        <div className="mt-4">
          <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm sm:text-3xl lg:text-4xl">
            {group.name}
          </h1>

          {group.description && (
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/90 sm:text-base">
              {group.description}
            </p>
          )}

          {/* Footer Metadata in Hero */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-white/80">
            {group.createdByName && (
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-white/90" />
                Led by <span className="font-semibold text-white">{group.createdByName}</span>
              </span>
            )}

            {formattedDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-white/80" />
                Created {formattedDate}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}