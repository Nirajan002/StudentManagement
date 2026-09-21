import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useGetAdminDashboardQuery } from "../api/DashboardApi";
import { useNavigate } from "react-router-dom";
import { StatCard, StatCardSkeleton } from "@/components/dashboard/StatCard";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  GraduationCap,
  Users2,
  Bell,
  ClipboardList,
  UserPlus,
  CalendarClock,
  ArrowRight,
} from "lucide-react";

export default function AdminIndex() {
  const { data, isLoading, isError } = useGetAdminDashboardQuery(undefined);
  const navigate = useNavigate();

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="p-6">
        <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              An overview of your school's students, teachers, and activities.
            </p>
          </div>
        </div>

        {/* LOADING SKELETON */}
        {isLoading && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="h-64 animate-pulse border-border/80 bg-muted/30 lg:col-span-2" />
              <Card className="h-64 animate-pulse border-border/80 bg-muted/30" />
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {isError && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center">
            <p className="text-sm font-medium text-destructive">
              Couldn't load dashboard data. Please try refreshing the page.
            </p>
          </div>
        )}

        {/* DASHBOARD CONTENT */}
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
                color="blue"
                hint={
                  data.newStudentsThisWeek > 0
                    ? `+${data.newStudentsThisWeek} this week`
                    : undefined
                }
                onClick={() => navigate("/StudentView")}
              />

              <StatCard
                icon={Users}
                label="Total Teachers"
                value={data.totalTeachers}
                color="violet"
                hint={
                  data.newTeachersThisWeek > 0
                    ? `+${data.newTeachersThisWeek} this week`
                    : undefined
                }
                onClick={() => navigate("/Teachers")}
              />

              <StatCard
                icon={Users2}
                label="Active Groups"
                value={data.activeGroups}
                color="emerald"
                hint={
                  data.inactiveGroups > 0
                    ? `${data.inactiveGroups} deactivated`
                    : undefined
                }
                onClick={() => navigate("/GroupsList")}
              />

              <StatCard
                icon={UserPlus}
                label="Avg. Group Size"
                value={data.averageGroupSize}
                color="rose"
              />

              <StatCard
                icon={Bell}
                label="Total Notices"
                value={data.totalNotices}
                color="amber"
                onClick={() => navigate("/GlobalNotices")}
              />

              <StatCard
                icon={ClipboardList}
                label="Total Assignments"
                value={data.totalAssignments}
                color="indigo"
                onClick={() => navigate("/MyAssignments")}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* =========================
                  RECENT ACTIVITY
              ========================= */}
              <Card className="border-border/80 shadow-xs lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base font-semibold">
                    Recent Activity
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  {data.recentActivity.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No recent activity recorded yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {data.recentActivity.map(
                        (item: {
                          id: string | number;
                          groupId: string | number;
                          type: string;
                          title: string;
                          groupName: string;
                          postedByName: string;
                          postedAt: string | number | Date;
                        }) => (
                          <div
                            key={item.id}
                            onClick={() => navigate(`/groups/${item.groupId}`)}
                            className="group flex cursor-pointer items-start gap-3 rounded-lg border border-transparent p-2.5 transition-all hover:border-border hover:bg-muted/50"
                          >
                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                              {item.type === "Notice" ? (
                                <Bell className="h-4 w-4 text-amber-500" />
                              ) : (
                                <ClipboardList className="h-4 w-4 text-blue-500" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium group-hover:text-primary">
                                {item.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                <span className="font-medium text-foreground/80">{item.groupName}</span> · {item.postedByName} ·{" "}
                                {new Date(item.postedAt).toLocaleString(undefined, {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })}
                              </p>
                            </div>

                            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* =========================
                  UPCOMING ASSIGNMENTS
              ========================= */}
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base font-semibold">
                    Upcoming Assignments
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  {data.upcomingAssignments.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No upcoming due dates.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {data.upcomingAssignments.map(
                        (item: {
                          id: string | number;
                          groupId: string | number;
                          title: string;
                          groupName: string;
                          dueDate: string | number | Date;
                        }) => (
                          <div
                            key={item.id}
                            onClick={() => navigate(`/groups/${item.groupId}`)}
                            className="group flex cursor-pointer items-start gap-2.5 rounded-lg border border-transparent p-2.5 transition-all hover:border-border hover:bg-muted/50"
                          >
                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                              <CalendarClock className="h-4 w-4" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium group-hover:text-primary">
                                {item.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.groupName} · Due{" "}
                                {new Date(item.dueDate).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* =========================
                GENDER BREAKDOWN
            ========================= */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  Student Gender Breakdown
                </CardTitle>
              </CardHeader>

              <CardContent>
                {data.genderBreakdown.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No student demographic data yet.
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {data.genderBreakdown.map(
                      (g: { gender: string; count: number }) => {
                        const percent =
                          data.totalStudents > 0
                            ? Math.round((g.count / data.totalStudents) * 100)
                            : 0;

                        return (
                          <div key={g.gender} className="rounded-lg border border-border/70 p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-sm font-medium">{g.gender}</span>
                              <span className="text-xs font-semibold text-muted-foreground">
                                {g.count} ({percent}%)
                              </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary transition-all duration-500"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      },
                    )}
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