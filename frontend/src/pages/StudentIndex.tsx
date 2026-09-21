import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useGetStudentDashboardQuery } from "../api/DashboardApi";
import { StatCard, StatCardSkeleton } from "@/components/dashboard/StatCard";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users2,
  Bell,
  ClipboardList,
  CalendarClock,
  ArrowRight,
} from "lucide-react";

export default function StudentIndex() {
  const { data, isLoading, isError } = useGetStudentDashboardQuery(undefined);
  const navigate = useNavigate();

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            An overview of your classes, upcoming assignments, and notices.
          </p>
        </div>

        {/* LOADING SKELETON */}
        {isLoading && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
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
              Couldn't load student dashboard data. Please try refreshing the page.
            </p>
          </div>
        )}

        {/* DASHBOARD CONTENT */}
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
                color="emerald"
                onClick={() => navigate("/GroupsList")}
              />

              <StatCard
                icon={ClipboardList}
                label="Total Assignments"
                value={data.totalAssignments}
                color="indigo"
                onClick={() => navigate("/MyAssignments")}
              />

              <StatCard
                icon={Bell}
                label="Total Notices"
                value={data.totalNotices}
                color="amber"
                onClick={() => navigate("/GlobalNotices")}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* =========================
                  RECENT ACTIVITY
              ========================= */}
              <Card className="border-border/80 shadow-xs lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
                </CardHeader>

                <CardContent>
                  {data.recentActivity.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No activity in your groups yet.
                    </div>
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
                      ))}
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
                      No upcoming due dates. You're all caught up!
                    </div>
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
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* =========================
                YOUR GROUPS
            ========================= */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-semibold">Your Groups</CardTitle>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/GroupsList")}
                  className="text-xs"
                >
                  View all
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </CardHeader>

              <CardContent>
                {data.myGroups.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    You haven't been added to any groups yet.
                  </div>
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
                        className="group cursor-pointer rounded-xl border border-border/80 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xs hover:bg-muted/30"
                      >
                        <p className="truncate text-sm font-semibold group-hover:text-primary">
                          {group.name}
                        </p>

                        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Users2 className="h-3.5 w-3.5 text-muted-foreground/80" />
                          <span>{group.memberCount} student{group.memberCount === 1 ? "" : "s"}</span>
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