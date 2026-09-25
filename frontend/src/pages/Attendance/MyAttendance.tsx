import { useState } from "react";
import { CalendarCheck, TrendingUp, Users, XCircle, Clock, CheckCircle2 } from "lucide-react";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

import { useGetMyAttendanceQuery } from "../../api/AttendanceApi";

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  Present: {
    label: "Present",
    className:
      "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  Absent: {
    label: "Absent",
    className:
      "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
    dot: "bg-red-500",
  },
  Late: {
    label: "Late",
    className:
      "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    dot: "bg-amber-500",
  },
  Excused: {
    label: "Excused",
    className:
      "bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20",
    dot: "bg-sky-500",
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return <Badge variant="outline">{status}</Badge>;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cfg.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
}

function StatCard({ label, value, icon, colorClass, bgClass }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className={`mt-1.5 text-2xl font-bold ${colorClass}`}>{value}</p>
          </div>
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${bgClass} ${colorClass}`}
          >
            {icon}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MyAttendance() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data, isLoading } = useGetMyAttendanceQuery({
    from: from || undefined,
    to: to || undefined,
  });

  const percent = data?.percentPresent ?? 0;
  const rateColor =
    percent >= 75
      ? "text-emerald-600"
      : percent >= 50
        ? "text-amber-600"
        : "text-red-600";
  const progressColor =
    percent >= 75
      ? "bg-emerald-500"
      : percent >= 50
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <DashboardLayout activeMenu="My Attendance">
      <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-8">
        {/* ── Header ── */}
        <div className="flex flex-col gap-1">
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20">
              <CalendarCheck className="h-5 w-5" />
            </span>
            My Attendance
          </h1>
          <p className="pl-14 text-sm text-muted-foreground">
            Track your attendance records and overall performance.
          </p>
        </div>

        {/* ── Date Filter ── */}
        <Card>
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Filter by Date Range
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4 pb-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="from" className="text-xs">
                From
              </Label>
              <Input
                id="from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-9 w-44"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="to" className="text-xs">
                To
              </Label>
              <Input
                id="to"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="h-9 w-44"
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Loading skeletons ── */}
        {isLoading && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          </div>
        )}

        {data && (
          <>
            {/* ── Stats Grid ── */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                label="Total"
                value={data.total}
                icon={<Users className="h-4 w-4" />}
                colorClass="text-foreground"
                bgClass="bg-muted"
              />
              <StatCard
                label="Present"
                value={data.present}
                icon={<CheckCircle2 className="h-4 w-4" />}
                colorClass="text-emerald-600 dark:text-emerald-400"
                bgClass="bg-emerald-500/10"
              />
              <StatCard
                label="Absent"
                value={data.absent}
                icon={<XCircle className="h-4 w-4" />}
                colorClass="text-red-600 dark:text-red-400"
                bgClass="bg-red-500/10"
              />
              <StatCard
                label="Late"
                value={data.late}
                icon={<Clock className="h-4 w-4" />}
                colorClass="text-amber-600 dark:text-amber-400"
                bgClass="bg-amber-500/10"
              />
            </div>

            {/* ── Attendance Rate Card ── */}
            <Card>
              <CardContent className="flex items-center gap-5 p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm font-medium text-muted-foreground">
                      Attendance Rate
                    </p>
                    <p className={`text-2xl font-bold ${rateColor}`}>
                      {data.percentPresent != null
                        ? `${data.percentPresent}%`
                        : "—"}
                    </p>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {data.present} present out of {data.total} sessions
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* ── Records List ── */}
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Attendance Records
              </h2>

              {data.records.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                    <CalendarCheck className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm font-medium text-muted-foreground">
                      No records found for this period
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      Try adjusting the date range filter above.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                  {data.records.map((r, idx) => (
                    <div
                      key={r.id}
                      className={`flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/40 ${
                        idx !== 0 ? "border-t" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-center">
                          <span className="text-xs font-bold leading-none text-muted-foreground">
                            {new Date(r.date).getDate()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {new Date(r.date).toLocaleDateString(undefined, {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {r.classSectionName}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}