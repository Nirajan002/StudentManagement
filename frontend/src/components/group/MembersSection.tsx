import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, UserMinus } from "lucide-react";

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

  return (
    <>
      <p className="mb-3 text-sm font-medium text-muted-foreground">
        {members.length} member{members.length === 1 ? "" : "s"}
      </p>

      <div className="space-y-2">
        {members.map((member) => (
          <Card key={member.studentId}>
            <CardContent className="flex items-center justify-between p-3">
              <div
                className="-m-1 flex flex-1 cursor-pointer items-center gap-3 rounded-md p-1 transition-colors hover:bg-muted/50"
                onClick={() => navigate(`/Student/${member.studentId}`)}
              >
                {getUploadUrl(member.profile) ? (
                  <img
                    src={getUploadUrl(member.profile)!}
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

              {canManageStudents && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(member.studentId);
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
              )}
            </CardContent>
          </Card>
        ))}

        {members.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No students in this group yet.
          </p>
        )}
      </div>
    </>
  );
}