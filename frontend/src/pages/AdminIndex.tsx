/* eslint-disable @typescript-eslint/no-explicit-any */
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useGetAdminDashboardQuery } from "../api/DashboardApi";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  GraduationCap,
  Users2,
  Bell,
  ClipboardList,
  UserPlus,
  Loader2,
  CalendarClock,
} from "lucide-react";

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  hint?: string;
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
          {hint && (
            <p className="mt-0.5 text-xs text-muted-foreground/80">{hint}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminIndex() {
  const { data, isLoading, isError } = useGetAdminDashboardQuery(undefined);
  const navigate = useNavigate();

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            An overview of your school.
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
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <StatCard
                icon={GraduationCap}
                label="Total Students"
                value={data.totalStudents}
                hint={
                  data.newStudentsThisWeek > 0
                    ? `+${data.newStudentsThisWeek} this week`
                    : undefined
                }
              />

              <StatCard
                icon={Users}
                label="Total Teachers"
                value={data.totalTeachers}
                hint={
                  data.newTeachersThisWeek > 0
                    ? `+${data.newTeachersThisWeek} this week`
                    : undefined
                }
              />

              <StatCard
                icon={Users2}
                label="Active Groups"
                value={data.activeGroups}
                hint={
                  data.inactiveGroups > 0
                    ? `${data.inactiveGroups} deactivated`
                    : undefined
                }
              />

              <StatCard
                icon={UserPlus}
                label="Avg. Group Size"
                value={data.averageGroupSize}
              />

              <StatCard
                icon={Bell}
                label="Total Notices"
                value={data.totalNotices}
              />

              <StatCard
                icon={ClipboardList}
                label="Total Assignments"
                value={data.totalAssignments}
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
                      No activity yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {data.recentActivity.map((item: any) => (
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
                  ASSIGNMENTS
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
                      No upcoming due dates.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {data.upcomingAssignments.map((item: any) => (
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
                GENDER BREAKDOWN
            ========================= */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Student Gender Breakdown
                </CardTitle>
              </CardHeader>

              <CardContent>
                {data.genderBreakdown.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No student data yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data.genderBreakdown.map((g: any) => {
                      const percent =
                        data.totalStudents > 0
                          ? Math.round((g.count / data.totalStudents) * 100)
                          : 0;

                      return (
                        <div key={g.gender}>
                          <div className="mb-1 flex justify-between text-sm">
                            <span>{g.gender}</span>
                            <span className="text-muted-foreground">
                              {g.count} ({percent}%)
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
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