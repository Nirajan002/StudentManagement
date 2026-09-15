import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useGetStudentDashboardQuery } from "../api/DashboardApi";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users2,
  Bell,
  ClipboardList,
  Loader2,
  CalendarClock,
  ArrowRight,
} from "lucide-react";

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="min-w-0">
          <p className="text-2xl font-semibold leading-none">{value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StudentIndex() {
  const { data, isLoading, isError } = useGetStudentDashboardQuery(undefined);
  const navigate = useNavigate();

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            An overview of your groups and coursework.
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading dashboard...
          </div>
        )}

        {isError && (
          <p className="text-sm text-destructive">
            Couldn't load dashboard data.
          </p>
        )}

        {data && (
          <div className="space-y-6">
            {/* =========================
                TOP STATS
            ========================= */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <StatCard
                icon={Users2}
                label="Groups you're in"
                value={data.totalGroups}
              />

              <StatCard
                icon={ClipboardList}
                label="Total Assignments"
                value={data.totalAssignments}
              />

              <StatCard
                icon={Bell}
                label="Total Notices"
                value={data.totalNotices}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* =========================
                  RECENT ACTIVITY
              ========================= */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Recent Activity</CardTitle>
                </CardHeader>

                <CardContent>
                  {data.recentActivity.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No activity in your groups yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {data.recentActivity.map((item: {
                        id: string | number;
                        groupId: string | number;
                        type: string;
                        title: string;
                        groupName: string;
                        postedByName: string;
                        postedAt: string;
                      }) => (
                        <div
                          key={item.id}
                          onClick={() => navigate(`/groups/${item.groupId}`)}
                          className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-muted"
                        >
                          <div className="mt-0.5 shrink-0">
                            {item.type === "Notice" ? (
                              <Bell className="h-4 w-4 text-amber-500" />
                            ) : (
                              <ClipboardList className="h-4 w-4 text-blue-500" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {item.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.groupName} · {item.postedByName} ·{" "}
                              {new Date(item.postedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* =========================
                  UPCOMING ASSIGNMENTS
              ========================= */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Upcoming Assignments
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  {data.upcomingAssignments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No upcoming due dates. You're all caught up!
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {data.upcomingAssignments.map((item: {
                        id: string | number;
                        groupId: string | number;
                        title: string;
                        groupName: string;
                        dueDate: string;
                      }) => (
                        <div
                          key={item.id}
                          onClick={() => navigate(`/groups/${item.groupId}`)}
                          className="flex cursor-pointer items-start gap-2 rounded-md p-2 hover:bg-muted"
                        >
                          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {item.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.groupName} · Due{" "}
                              {new Date(item.dueDate).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* =========================
                YOUR GROUPS
            ========================= */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Your Groups</CardTitle>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/GroupsList")}
                >
                  View all
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </CardHeader>

              <CardContent>
                {data.myGroups.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    You haven't been added to any groups yet.
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {data.myGroups.map((group: {
                      id: string | number;
                      name: string;
                      memberCount: number;
                    }) => (
                      <div
                        key={group.id}
                        onClick={() => navigate(`/groups/${group.id}`)}
                        className="cursor-pointer rounded-lg border p-4 transition-colors hover:border-foreground/20 hover:bg-muted/40"
                      >
                        <p className="truncate text-sm font-medium">
                          {group.name}
                        </p>

                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Users2 className="h-3 w-3" />
                          {group.memberCount} student
                          {group.memberCount === 1 ? "" : "s"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}