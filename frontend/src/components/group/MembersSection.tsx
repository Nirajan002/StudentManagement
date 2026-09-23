import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, UserMinus, Search, Users, ExternalLink } from "lucide-react";

import { initials } from "../utils/initials";
import { getUploadUrl } from "@/lib/config";

interface Member {
  studentId: string;
  profile?: string | null;
  fullName: string;
  email: string;
}

interface MembersSectionProps {
  members: Member[];
  canManageStudents: boolean;
  removingId: string | null;
  onRemove: (studentId: string) => void;
}

export default function MembersSection({
  members,
  canManageStudents,
  removingId,
  onRemove,
}: MembersSectionProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return members;
    const q = search.toLowerCase();
    return members.filter(
      (m) =>
        m.fullName?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q)
    );
  }, [members, search]);

  return (
    <div className="rounded-xl border border-border/80 bg-card p-4 shadow-xs">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-semibold text-foreground">Enrolled Students</h3>
          <Badge variant="secondary" className="h-5 px-1.5 text-xs font-medium">
            {members.length}
          </Badge>
        </div>
      </div>

      {members.length > 5 && (
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      )}

      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 thin-scrollbar">
        {filteredMembers.map((member) => {
          const profileUrl = getUploadUrl(member.profile);

          return (
            <div
              key={member.studentId}
              className="group flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2.5 transition-all hover:border-border hover:bg-muted/40"
            >
              <div
                className="flex flex-1 cursor-pointer items-center gap-3 min-w-0"
                onClick={() => navigate(`/Student/${member.studentId}`)}
              >
                <Avatar className="h-9 w-9 shrink-0 border border-border/70">
                  {profileUrl && (
                    <AvatarImage src={profileUrl} alt={member.fullName} />
                  )}
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {initials(member.fullName)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-medium leading-tight text-foreground group-hover:text-primary">
                      {member.fullName}
                    </p>
                    <ExternalLink className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {member.email}
                  </p>
                </div>
              </div>

              {canManageStudents && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground opacity-60 hover:text-destructive hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(member.studentId);
                  }}
                  disabled={removingId === member.studentId}
                  aria-label={`Remove ${member.fullName}`}
                >
                  {removingId === member.studentId ? (
                    <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                  ) : (
                    <UserMinus className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          );
        })}

        {filteredMembers.length === 0 && members.length > 0 && (
          <p className="py-6 text-center text-xs text-muted-foreground">
            No students matching &quot;{search}&quot;.
          </p>
        )}

        {members.length === 0 && (
          <div className="py-8 text-center">
            <Users className="mx-auto mb-2 h-7 w-7 text-muted-foreground/50" />
            <p className="text-xs font-medium text-foreground">No students yet</p>
            <p className="text-[11px] text-muted-foreground">
              Add students to start collaborating in this group.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}