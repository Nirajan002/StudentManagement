import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus, Loader2, ShieldCheck } from "lucide-react";
import { useGetGroupsQuery } from "../../api/GroupApi";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function GroupsList() {
  const { data: groups, isLoading, isError } = useGetGroupsQuery(undefined);
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Groups</h1>
            <p className="text-sm text-muted-foreground">
              Organize students into groups for announcements and coordination.
            </p>
          </div>
          <Button onClick={() => navigate("/CreateGroup")}>
            <Plus className="mr-2 h-4 w-4" />
            New group
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading groups...
          </div>
        )}

        {isError && (
          <p className="text-sm text-destructive">Couldn't load groups.</p>
        )}

        {!isLoading && !isError && groups?.length === 0 && (
          <div className="rounded-lg border border-dashed py-16 text-center">
            <Users className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="font-medium">No groups yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first group to start organizing students.
            </p>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {groups?.map((group: any) => (
            <Link key={group.id} to={`/groups/${group.id}`}>
              <Card className="transition-colors hover:border-foreground/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{group.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {group.description && (
                    <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
                      {group.description}
                    </p>
                  )}

                  {/* Member count */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {group.memberCount ?? 0} student
                    {group.memberCount === 1 ? "" : "s"}
                  </div>

                  {/* Admin / creator */}
                  {group.createdByName && (
                    <p
                      className="mt-2 flex w-fit cursor-pointer items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/Teacher/${group.createdById}`);
                      }}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {group.createdByRole || "Admin"}:{" "}
                      <span className="font-medium text-foreground">
                        {group.createdByName}
                      </span>
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}